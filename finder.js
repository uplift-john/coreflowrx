// CoreFlow Rx — therapy / condition finder. No dependencies, no build step.
//
// Progressive enhancement contract:
//   • Without JS the page is a complete, readable, grouped list. The specialty
//     chips are ordinary in-page anchors and the search field is never shown
//     (it carries `hidden` in the markup; only this script reveals it), so a
//     no-JS visitor is never offered a control that does nothing.
//   • With JS the search field appears, the chips filter in place instead of
//     scrolling, and every change is announced through one polite live region.
//   • Focus is never moved on the user's behalf — it stays in the field they
//     are typing in, and the live region does the talking. The initial count
//     is rendered server-side so nothing is announced on page load.
//   • State is conveyed by text and markup, never by colour alone.
//   (WCAG 2.1 AA: 1.4.1, 3.2.2, 4.1.3.)
(function () {
  "use strict";

  var ANNOUNCE_DELAY = 250;

  function normalise(value) {
    return (value || "")
      .toLowerCase()
      .replace(/[‘’']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setupFinder(root) {
    var controls = root.querySelector("[data-finder-controls]");
    var input = root.querySelector("[data-finder-input]");
    var status = root.querySelector("[data-finder-status]");
    var empty = root.querySelector("[data-finder-empty]");
    var clearBtn = root.querySelector("[data-finder-clear]");
    var form = root.querySelector("[data-finder-form]");
    var chips = Array.prototype.slice.call(root.querySelectorAll("[data-finder-filter]"));
    var groups = Array.prototype.slice.call(root.querySelectorAll("[data-finder-group]"));
    var items = Array.prototype.slice.call(root.querySelectorAll("[data-finder-item]"));

    if (!controls || !input || !status || !items.length) return;

    var noun = root.getAttribute("data-finder-noun") || "results";

    function distinct(list) {
      var seen = Object.create(null);
      var count = 0;
      list.forEach(function (item) {
        var key = item.getAttribute("data-finder-key") || item.getAttribute("data-search") || "";
        if (!seen[key]) {
          seen[key] = true;
          count++;
        }
      });
      return count;
    }

    // A therapy is listed once per specialty it serves, so the DOM row count
    // overstates it. Announcements count distinct entries — what the reader sees.
    var total = distinct(items);
    var activeSpecialty = "";
    var announceTimer = null;

    // Cache the haystack once. data-search is built server-side from _data/ —
    // name, generic, aliases, class and specialty names all live in it.
    items.forEach(function (item) {
      // Fail OPEN on a data gap: an item missing data-search or
      // data-specialties must always show, never silently vanish from results.
      item._hasHaystack = item.hasAttribute("data-search");
      item._haystack = normalise(item.getAttribute("data-search"));
      item._hasSpecialties = item.hasAttribute("data-specialties");
      item._specialties = (item.getAttribute("data-specialties") || "")
        .split(" ")
        .filter(Boolean);
    });

    groups.forEach(function (group) {
      group._items = Array.prototype.slice.call(group.querySelectorAll("[data-finder-item]"));
      group._specialty = group.getAttribute("data-finder-group") || "";
    });

    function announce(text) {
      window.clearTimeout(announceTimer);
      announceTimer = window.setTimeout(function () {
        status.textContent = text;
      }, ANNOUNCE_DELAY);
    }

    function apply(isInitial) {
      var query = normalise(input.value);
      var terms = query ? query.split(" ") : [];
      var filtering = !!query || !!activeSpecialty;
      var visibleItems = [];

      // On a text query the specialty grouping is not what the user is navigating
      // by, and a therapy listed in three specialties would paint three identical
      // cards under a status line saying "1". Collapse to the first match per key;
      // each card already carries its "Also listed under" tags.
      var seenKey = query ? Object.create(null) : null;

      items.forEach(function (item) {
        var matchesText =
          !item._hasHaystack ||
          terms.every(function (term) {
            return item._haystack.indexOf(term) !== -1;
          });
        var matchesSpecialty =
          !activeSpecialty ||
          !item._hasSpecialties ||
          item._specialties.indexOf(activeSpecialty) !== -1;
        var visible = matchesText && matchesSpecialty;
        if (visible && seenKey) {
          var key = item.getAttribute("data-finder-key") || "";
          if (seenKey[key]) visible = false;
          else seenKey[key] = true;
        }
        item.hidden = !visible;
        if (visible) visibleItems.push(item);
      });

      var shown = distinct(visibleItems);

      groups.forEach(function (group) {
        if (group._items.length) {
          // Drop a group whose every item filtered out, heading and all, so no
          // empty section header is left stranded.
          group.hidden = !group._items.some(function (item) {
            return !item.hidden;
          });
        } else {
          // A group with no items at all is a specialty whose therapy list is
          // still pending clinical confirmation. It must survive a specialty
          // filter that selects it — that visitor specifically needs to see the
          // pending notice — but not a text query it cannot match.
          group.hidden = !!query || (!!activeSpecialty && activeSpecialty !== group._specialty);
        }
      });

      // A visible group with no items is a specialty whose list is pending; it
      // already answers the question, so the generic empty box would be a
      // second, contradictory answer.
      var pendingGroupVisible = groups.some(function (group) {
        return !group._items.length && !group.hidden;
      });
      // During a text search the specialty grouping is not what the reader is
      // navigating by — results are deduplicated across specialties — so the
      // group headings are pure chrome between the field and the answer.
      root.classList.toggle("finder--searching", !!query);

      if (empty) empty.hidden = shown !== 0 || pendingGroupVisible;
      // disabled, not hidden: the button keeps its box, so the input the user is
      // typing in does not resize under the caret on the first keystroke.
      if (clearBtn) clearBtn.disabled = !filtering;

      // Nothing is announced for the first pass: the count is already in the
      // markup, and a live region written to on load produces a spurious
      // announcement.
      if (isInitial) return;

      var scope = "";
      if (activeSpecialty) {
        var activeChip = chips.filter(function (chip) {
          return chip.getAttribute("data-finder-filter") === activeSpecialty;
        })[0];
        if (activeChip) scope = activeChip.textContent.replace(/^\u2713\s*/, "").trim() + " \u2014 ";
      }

      if (!filtering) {
        announce("Showing all " + total + " " + noun + ".");
      } else if (shown === 0 && pendingGroupVisible) {
        announce("No " + noun + " listed for that specialty yet. Call to confirm.");
      } else if (shown === 0) {
        announce(
          query
            ? "No matches for that search. " + total + " " + noun + " searched."
            : "No " + noun + " listed for that specialty."
        );
      } else {
        announce(scope + "showing " + shown + " of " + total + " " + noun + ".");
      }
    }

    function setSpecialty(value) {
      activeSpecialty = value;
      chips.forEach(function (chip) {
        var on = chip.getAttribute("data-finder-filter") === value;
        chip.setAttribute("aria-pressed", on ? "true" : "false");
      });
      apply(false);
    }

    input.addEventListener("input", function () {
      apply(false);
    });
    input.addEventListener("search", function () {
      apply(false);
    });

    // Submitting would reload the page and lose the filter. The field filters
    // live, so there is nothing to submit.
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply(false);
      });
    }

    chips.forEach(function (chip) {
      // Only now that they filter rather than navigate: without JS they stay
      // ordinary anchors to a real per-specialty section.
      chip.setAttribute("role", "button");
      chip.setAttribute("aria-pressed", "false");
      function toggle(event) {
        event.preventDefault();
        var value = chip.getAttribute("data-finder-filter");
        setSpecialty(activeSpecialty === value ? "" : value);
      }
      chip.addEventListener("click", toggle);
      chip.addEventListener("keydown", function (event) {
        if (event.key === " " || event.key === "Spacebar") toggle(event);
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        setSpecialty("");
        input.focus();
      });
    }

    // Reveal the controls only now that they work.
    controls.hidden = false;
    apply(true);
  }

  // Run immediately: the tag is `defer`, so the DOM is parsed by the time this
  // executes. Waiting for DOMContentLoaded as well injected the ~113px control
  // block into an already-painted page, shifting the whole list down.
  Array.prototype.slice
    .call(document.querySelectorAll("[data-finder]"))
    .forEach(setupFinder);
})();
