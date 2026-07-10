(function () {
  "use strict";

  var STORAGE_KEY = "gymTrackerData";
  var app = document.getElementById("app");
  var state = { view: { name: "home" } };
  var data = load();

  // Upgrades data saved by an older version of this app (free-text entries)
  // to the current structured {weight, reps} sets format, preserving the
  // original text as a note instead of dropping it.
  function migrate(d) {
    var changed = false;
    if (!d.version || d.version < 2) {
      (d.sessions || []).forEach(function (s) {
        (s.entries || []).forEach(function (e) {
          if (!e.sets) {
            e.sets = [];
            if (e.text) e.note = e.note ? e.note + " | " + e.text : e.text;
            delete e.text;
            changed = true;
          }
        });
      });
      d.version = 2;
      changed = true;
    }
    return changed;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (migrate(parsed)) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
    } catch (e) { /* fall through to seed */ }
    var seeded = JSON.parse(JSON.stringify(SEED_DATA));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function fmtDate(iso) {
    var parts = iso.split("-");
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function daysAgo(iso) {
    var d = new Date(iso + "T00:00:00");
    var diff = Math.round((Date.now() - d.getTime()) / 86400000);
    if (diff <= 0) return "today";
    if (diff === 1) return "1 day ago";
    return diff + " days ago";
  }

  function sessionsFor(routineId) {
    return data.sessions
      .filter(function (s) { return s.routineId === routineId; })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function lastSessionFor(routineId) {
    var list = sessionsFor(routineId);
    return list.length ? list[0] : null;
  }

  function lastEntryFor(routineId, exercise) {
    var list = sessionsFor(routineId);
    for (var i = 0; i < list.length; i++) {
      var entry = list[i].entries.find(function (e) { return e.exercise === exercise; });
      if (entry) return { sets: entry.sets || [], note: entry.note || "", date: list[i].date };
    }
    return null;
  }

  var MAX_SETS = 4;

  // Renders sets read-only, using the same set-box grid look as the log
  // screen's input boxes, so history matches how you enter a workout.
  function renderSetsGrid(sets) {
    if (!sets || !sets.length) return "";
    var boxes = sets.map(function (s) {
      return (
        '<div class="set-box">' +
          '<div class="set-weight">' + esc(s.weight) + "</div>" +
          '<div class="set-reps">' + (s.reps != null ? esc(s.reps) + " reps" : "&mdash;") + "</div>" +
        "</div>"
      );
    }).join("");
    return '<div class="sets-grid history-sets-grid">' + boxes + "</div>";
  }

  // ---------------- Analytics ----------------

  var ROUTINE_IDS = ["pull", "push", "leg"];

  // Exercises where a LOWER number is the harder/better direction — assisted-machine
  // moves where the weight is how much help you're getting, not how much you're lifting.
  var INVERSE_EXERCISES = ["Pullup"];
  function isInverse(exercise) { return INVERSE_EXERCISES.indexOf(exercise) !== -1; }

  // The "top set" is whichever set was hardest that session; reps break ties.
  function topSet(sets, inverse) {
    if (!sets || !sets.length) return null;
    return sets.reduce(function (best, s) {
      if (!best) return s;
      var harder = inverse ? s.weight < best.weight : s.weight > best.weight;
      if (harder) return s;
      if (s.weight === best.weight && (s.reps || 0) > (best.reps || 0)) return s;
      return best;
    }, null);
  }

  // Ascending-by-date series of top-set weight/reps for one exercise, one point per session it appears in.
  function exerciseHistoryPoints(routineId, exercise) {
    var inverse = isInverse(exercise);
    var sessions = sessionsFor(routineId).slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
    var points = [];
    sessions.forEach(function (s) {
      var entry = s.entries.find(function (e) { return e.exercise === exercise; });
      if (!entry) return;
      var top = topSet(entry.sets, inverse);
      if (!top) return;
      points.push({ date: s.date, weight: top.weight, reps: top.reps });
    });
    return points;
  }

  // Best-ever effort logged, per exercise, across every routine — for the personal-records list.
  function allTimeRecords() {
    var records = {};
    data.sessions.forEach(function (s) {
      s.entries.forEach(function (e) {
        var inverse = isInverse(e.exercise);
        var top = topSet(e.sets, inverse);
        if (!top) return;
        var key = s.routineId + "|" + e.exercise;
        var better = !records[key] || (inverse ? top.weight < records[key].weight : top.weight > records[key].weight);
        if (better) {
          records[key] = { routineId: s.routineId, exercise: e.exercise, weight: top.weight, reps: top.reps, date: s.date };
        }
      });
    });
    return Object.keys(records).map(function (k) { return records[k]; });
  }

  // Simple, transparent progressive-overload heuristic — always shows its reasoning
  // rather than a black-box verdict. Not medical or coaching advice, just a nudge.
  // Direction-aware: "progressed" means harder, regardless of whether that's a higher
  // or lower number for this particular exercise (see INVERSE_EXERCISES).
  function buildRecommendation(routineId, exercise) {
    var pts = exerciseHistoryPoints(routineId, exercise);
    if (!pts.length) return { tone: "neutral", text: "No sessions logged yet — recommendations show up after your first one." };

    var inverse = isInverse(exercise);
    var latest = pts[pts.length - 1];
    var prev = pts.length > 1 ? pts[pts.length - 2] : null;
    var sinceDays = Math.round((Date.now() - new Date(latest.date + "T00:00:00").getTime()) / 86400000);

    if (sinceDays > 14) {
      return { tone: "caution", text: "It's been " + sinceDays + " days since you trained this — ease back in around " + latest.weight + " before pushing for more." };
    }
    if (!prev) {
      return { tone: "neutral", text: "One session logged (" + latest.weight + (latest.reps != null ? "×" + latest.reps : "") + ") — a couple more and you'll get a trend-based tip." };
    }

    var progressed = inverse ? latest.weight < prev.weight : latest.weight > prev.weight;
    var regressed = inverse ? latest.weight > prev.weight : latest.weight < prev.weight;

    if (progressed) {
      if (latest.reps != null && latest.reps < 6) {
        return { tone: "caution", text: "You made this harder last time (now " + latest.weight + ") and reps dropped to " + latest.reps + " — hold here until reps recover before pushing further." };
      }
      return { tone: "good", text: "Nice progress to " + latest.weight + " — stay there and build reps back up before the next step." };
    }
    if (regressed) {
      return { tone: "neutral", text: "This eased back from " + prev.weight + " to " + latest.weight + " — fine after a hard session, worth a look if it keeps trending that way." };
    }

    // same weight as last time
    if (latest.reps != null && prev.reps != null && latest.reps >= 10 && prev.reps >= 10) {
      return { tone: "good", text: "You've held " + latest.weight + " for 10+ reps two sessions running — try making it a bit harder next time." };
    }
    var lastFew = pts.slice(-4);
    var flatWeight = lastFew.every(function (p) { return p.weight === lastFew[0].weight; });
    if (flatWeight && lastFew.length >= 3) {
      return { tone: "caution", text: "This has been at " + latest.weight + " for " + lastFew.length + " sessions — try pushing it a bit harder, or aim for more reps, to break through." };
    }
    return { tone: "neutral", text: "Steady at " + latest.weight + " — keep working reps up before the next step." };
  }

  // 2px line, r>=4 markers with a 2px surface-color ring, endpoint + PR direct-labeled.
  // Label anchor shifts near the edges so text never clips outside the viewBox.
  function renderLineChart(points, inverse) {
    if (points.length < 2) return "";
    var w = 320, h = 130, padX = 26, padY = 22;
    var weights = points.map(function (p) { return p.weight; });
    var min = Math.min.apply(null, weights), max = Math.max.apply(null, weights);
    var range = max - min || 1;
    var xy = points.map(function (p, i) {
      var x = padX + (i / (points.length - 1)) * (w - padX * 2);
      var y = h - padY - ((p.weight - min) / range) * (h - padY * 2);
      return { x: x, y: y, p: p };
    });
    var linePts = xy.map(function (c) { return c.x.toFixed(1) + "," + c.y.toFixed(1); }).join(" ");
    var bestVal = inverse ? min : max;
    var bestIdx = weights.indexOf(bestVal);
    var lastIdx = xy.length - 1;

    var dots = xy.map(function (c, i) {
      return '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="4" fill="#10b981" stroke="#0b0f14" stroke-width="2"><title>' +
        esc(fmtDate(c.p.date)) + ": " + esc(c.p.weight) + (c.p.reps != null ? "×" + esc(c.p.reps) : "") + "</title></circle>";
    }).join("");

    function label(i, text, isAbove) {
      var c = xy[i];
      var ty = isAbove ? c.y - 10 : c.y + 16;
      var anchor = "middle";
      if (c.x < padX + 4) anchor = "start";
      else if (c.x > w - padX - 4) anchor = "end";
      return '<text x="' + c.x.toFixed(1) + '" y="' + ty.toFixed(1) + '" font-size="11" fill="#8b98a5" text-anchor="' + anchor + '">' + esc(text) + "</text>";
    }

    var labels = label(lastIdx, String(xy[lastIdx].p.weight), xy[lastIdx].y > h / 2);
    if (bestIdx !== lastIdx) labels += label(bestIdx, "PR " + weights[bestIdx], xy[bestIdx].y > h / 2);

    return (
      '<svg class="trend exercise-trend" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none">' +
        '<polyline points="' + linePts + '" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        dots + labels +
      "</svg>"
    );
  }

  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1600);
  }

  function go(name, params) {
    state.view = { name: name, params: params || {} };
    render();
    window.scrollTo(0, 0);
  }

  // ---------------- Views ----------------

  function viewHome() {
    var weightEntries = data.bodyWeight.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var latestWeight = weightEntries[0];
    var routineOrder = ["pull", "push", "leg"];
    var cards = routineOrder.map(function (id) {
      var r = data.routines[id];
      var last = lastSessionFor(id);
      var meta = last ? daysAgo(last.date) : "no logs yet";
      return (
        '<button class="routine-card" data-action="open-log" data-routine="' + id + '">' +
          '<span class="label">' + esc(r.label) + "</span>" +
          '<span class="meta">' + esc(meta) + "</span>" +
        "</button>"
      );
    }).join("");

    return (
      '<div class="topbar"><h1>Gym Tracker</h1></div>' +
      '<div class="home-grid">' +
        '<button class="routine-card weight" data-action="open-weight">' +
          '<span><span class="label">Body weight</span><br><span class="meta">' +
            (latestWeight ? esc(fmtDate(latestWeight.date)) : "no entries") + "</span></span>" +
          '<span class="value">' + (latestWeight ? esc(latestWeight.value) : "—") + "</span>" +
        "</button>" +
        cards +
      "</div>" +
      '<div class="section">' +
        '<button class="secondary-btn" data-action="open-progress">Progress &amp; recommendations</button>' +
        '<button class="secondary-btn" data-action="open-history-picker">View history</button>' +
      "</div>" +
      '<div class="settings-link" data-action="open-settings">Settings &amp; backup</div>'
    );
  }

  function viewProgress() {
    var totalSessions = data.sessions.length;
    var monthPrefix = todayStr().slice(0, 7);
    var thisMonth = data.sessions.filter(function (s) { return s.date.slice(0, 7) === monthPrefix; }).length;
    var mostRecentDate = data.sessions.reduce(function (max, s) { return !max || s.date > max ? s.date : max; }, null);
    var sinceLast = mostRecentDate ? daysAgo(mostRecentDate) : "no workouts yet";

    var weightEntries = data.bodyWeight.slice().sort(function (a, b) { return a.date.localeCompare(b.date); });
    var weightDelta = "";
    if (weightEntries.length >= 2) {
      var d = weightEntries[weightEntries.length - 1].value - weightEntries[0].value;
      weightDelta = (d > 0 ? "+" : "") + d.toFixed(1) + " since first log";
    }

    var records = allTimeRecords();
    var prGroups = ROUTINE_IDS.map(function (id) {
      var rows = records
        .filter(function (r) { return r.routineId === id; })
        .sort(function (a, b) { return b.weight - a.weight; })
        .map(function (r) {
          return (
            '<div class="pr-row">' +
              '<span class="pr-name">' + esc(r.exercise) + (isInverse(r.exercise) ? ' <span class="pr-date">(least assist)</span>' : "") + "</span>" +
              '<span class="pr-value">' + esc(r.weight) + (r.reps != null ? "&times;" + esc(r.reps) : "") +
                '<span class="pr-date">' + esc(fmtDate(r.date)) + "</span></span>" +
            "</div>"
          );
        }).join("");
      if (!rows) return "";
      return '<div class="pr-group-label">' + esc(data.routines[id].label) + "</div>" + rows;
    }).join("");

    var routineButtons = ROUTINE_IDS.map(function (id) {
      return '<button class="routine-card" data-action="open-progress-routine" data-routine="' + id + '">' +
        '<span class="label">' + esc(data.routines[id].label) + "</span></button>";
    }).join("");

    return (
      '<div class="topbar"><button class="back-btn" data-action="home">&larr; Home</button><h1>Progress</h1><span></span></div>' +
      '<div class="stat-grid">' +
        '<div class="stat-tile"><div class="stat-label">Total workouts</div><div class="stat-value">' + totalSessions + "</div></div>" +
        '<div class="stat-tile"><div class="stat-label">This month</div><div class="stat-value">' + thisMonth + "</div></div>" +
        '<div class="stat-tile"><div class="stat-label">Last workout</div><div class="stat-value" style="font-size:16px">' + esc(sinceLast) + "</div></div>" +
        '<div class="stat-tile"><div class="stat-label">Body weight change</div><div class="stat-value" style="font-size:16px">' + (esc(weightDelta) || "&mdash;") + "</div></div>" +
      "</div>" +
      '<div class="section-title">By exercise</div>' +
      '<div class="home-grid" style="margin-bottom:18px">' + routineButtons + "</div>" +
      '<div class="section-title">Personal records</div>' +
      '<div class="pr-list">' + (prGroups || '<div class="empty">Log a few workouts to see records here.</div>') + "</div>"
    );
  }

  function viewProgressRoutine(routineId) {
    var routine = data.routines[routineId];
    var buttons = routine.exercises.map(function (ex) {
      var pts = exerciseHistoryPoints(routineId, ex);
      var meta = pts.length ? pts.length + " session" + (pts.length === 1 ? "" : "s") + " logged" : "no data yet";
      return (
        '<button class="exercise-pick-btn" data-action="open-progress-exercise" data-routine="' + routineId + '" data-exercise="' + esc(ex) + '">' +
          "<span>" + esc(ex) + "</span><span class=\"meta\">" + esc(meta) + "</span>" +
        "</button>"
      );
    }).join("");
    return (
      '<div class="topbar">' +
        '<button class="back-btn" data-action="open-progress">&larr; Back</button>' +
        "<h1>" + esc(routine.label) + "</h1><span></span>" +
      "</div>" +
      buttons
    );
  }

  var REC_ICON_BY_TONE = { good: "&#9650;", caution: "&#9888;", neutral: "&#8226;" };
  var REC_LABEL_BY_TONE = { good: "Trending up", caution: "Heads up", neutral: "Recommendation" };

  // Compact, tappable version of the recommendation card for the log screen —
  // a glance-able nudge while you're actually keying in weights.
  function renderCompactRec(routineId, exercise) {
    var rec = buildRecommendation(routineId, exercise);
    return (
      '<button class="log-rec tone-' + rec.tone + '" data-action="open-progress-exercise" data-routine="' + routineId + '" data-exercise="' + esc(exercise) + '">' +
        '<span class="log-rec-icon">' + REC_ICON_BY_TONE[rec.tone] + "</span>" +
        '<span>' + esc(rec.text) + "</span>" +
      "</button>"
    );
  }

  function viewProgressExercise(routineId, exercise) {
    var pts = exerciseHistoryPoints(routineId, exercise);
    var rec = buildRecommendation(routineId, exercise);

    var chart = renderLineChart(pts, isInverse(exercise));
    var chartBlock = chart
      ? '<div class="chart-wrap"><div class="chart-title">Top set weight over time</div>' + chart + "</div>"
      : '<div class="empty">Log this exercise a couple more times to see a trend chart.</div>';

    var recentRows = pts.slice(-6).reverse().map(function (p) {
      return '<div class="pr-row"><span class="pr-name">' + esc(fmtDate(p.date)) + "</span><span class=\"pr-value\">" +
        esc(p.weight) + (p.reps != null ? "&times;" + esc(p.reps) : "") + "</span></div>";
    }).join("");

    return (
      '<div class="topbar">' +
        '<button class="back-btn" data-action="open-progress-routine" data-routine="' + routineId + '">&larr; Back</button>' +
        "<h1>" + esc(exercise) + "</h1><span></span>" +
      "</div>" +
      '<div class="recommendation-card tone-' + rec.tone + '">' +
        '<span class="rec-icon">' + REC_ICON_BY_TONE[rec.tone] + "</span>" +
        '<span><span class="rec-label">' + REC_LABEL_BY_TONE[rec.tone] + "</span>" + esc(rec.text) + "</span>" +
      "</div>" +
      chartBlock +
      '<div class="section-title">Recent sessions</div>' +
      '<div class="pr-list">' + (recentRows || '<div class="empty">Nothing logged yet.</div>') + "</div>"
    );
  }

  function viewLog(routineId) {
    var routine = data.routines[routineId];
    var existingToday = sessionsFor(routineId).find(function (s) { return s.date === todayStr(); });
    var dateVal = existingToday ? existingToday.date : todayStr();
    var lastSession = lastSessionFor(routineId);
    var notePlaceholder = lastSession && lastSession.note ? lastSession.note : "";

    var rows = routine.exercises.map(function (ex) {
      var prefillEntry = existingToday && existingToday.entries.find(function (e) { return e.exercise === ex; });
      var last = lastEntryFor(routineId, ex);
      var sourceSets = prefillEntry ? prefillEntry.sets : (last ? last.sets : []);
      var noteVal = prefillEntry ? (prefillEntry.note || "") : "";
      var notePlaceholder = last && last.note ? last.note : "note (optional)";
      var hint = last ? "last " + fmtDate(last.date) : "not logged before";

      var boxes = "";
      for (var i = 0; i < MAX_SETS; i++) {
        var s = sourceSets && sourceSets[i];
        var w = s && s.weight != null ? s.weight : "";
        var r = s && s.reps != null ? s.reps : "";
        boxes +=
          '<div class="set-box">' +
            '<input type="number" step="0.5" inputmode="decimal" class="set-weight" placeholder="lbs" data-set="' + i + '" value="' + esc(w) + '">' +
            '<input type="number" step="1" inputmode="numeric" class="set-reps" placeholder="reps" data-set="' + i + '" value="' + esc(r) + '">' +
          "</div>";
      }

      return (
        '<div class="exercise-block" data-exercise="' + esc(ex) + '">' +
          '<div class="field-row"><label>' + esc(ex) + "</label>" +
            '<span class="last-value">' + esc(hint) + "</span></div>" +
          renderCompactRec(routineId, ex) +
          '<div class="sets-grid">' + boxes + "</div>" +
          '<input type="text" class="exercise-note" placeholder="' + esc(notePlaceholder) + '" value="' + esc(noteVal) + '">' +
        "</div>"
      );
    }).join("");

    return (
      '<div class="topbar">' +
        '<button class="back-btn" data-action="home">&larr; Home</button>' +
        "<h1>" + esc(routine.label) + "</h1>" +
        '<button class="back-btn" data-action="open-routine-history" data-routine="' + routineId + '">History</button>' +
      "</div>" +
      '<div class="date-field"><span>Date</span><input type="date" id="log-date" value="' + dateVal + '"></div>' +
      '<div id="exercise-list">' + rows + "</div>" +
      '<div class="add-exercise-row">' +
        '<input type="text" id="new-exercise-name" placeholder="Add exercise to ' + esc(routine.label) + '&hellip;">' +
        '<button class="icon-btn" data-action="add-exercise" data-routine="' + routineId + '">Add</button>' +
      "</div>" +
      '<div class="session-note-field">' +
        '<textarea id="session-note" placeholder="' + esc(notePlaceholder || "Session note (optional)") + '">' +
          (existingToday && existingToday.note ? esc(existingToday.note) : "") +
        "</textarea>" +
      "</div>" +
      '<button class="primary-btn" data-action="save-session" data-routine="' + routineId + '">' +
        (existingToday ? "Update today’s log" : "Save workout") +
      "</button>"
    );
  }

  function viewRoutineHistory(routineId) {
    var routine = data.routines[routineId];
    var list = sessionsFor(routineId);
    var items = list.map(function (s) {
      var rows = s.entries.map(function (e) {
        return (
          '<div class="history-exercise">' +
            '<div class="ex-name">' + esc(e.exercise) + "</div>" +
            renderSetsGrid(e.sets) +
            (e.note ? '<div class="entry-note">' + esc(e.note) + "</div>" : "") +
          "</div>"
        );
      }).join("");
      return (
        '<div class="history-item">' +
          '<div class="date">' + esc(fmtDate(s.date)) + "</div>" +
          (s.note ? '<div class="note">' + esc(s.note) + "</div>" : "") +
          rows +
          '<button class="danger-btn" data-action="delete-session" data-id="' + s.id + '">Delete this session</button>' +
        "</div>"
      );
    }).join("");

    return (
      '<div class="topbar">' +
        '<button class="back-btn" data-action="open-log" data-routine="' + routineId + '">&larr; Back</button>' +
        "<h1>" + esc(routine.label) + " history</h1>" +
        "<span></span>" +
      "</div>" +
      (items || '<div class="empty">No sessions logged yet.</div>')
    );
  }

  function viewHistoryPicker() {
    var options = ["pull", "push", "leg"].map(function (id) {
      return '<button class="routine-card" data-action="open-routine-history" data-routine="' + id + '">' +
        '<span class="label">' + esc(data.routines[id].label) + "</span></button>";
    }).join("");
    return (
      '<div class="topbar"><button class="back-btn" data-action="home">&larr; Home</button><h1>History</h1><span></span></div>' +
      '<div class="home-grid">' + options + "</div>" +
      '<div class="routine-card weight" style="margin-top:12px" data-action="open-weight">' +
        '<span class="label">Body weight trend</span></div>'
    );
  }

  function viewWeight() {
    var entries = data.bodyWeight.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    var latest = entries[0];
    var trend = entries.slice(0, 12).slice().reverse();
    var svg = "";
    if (trend.length > 1) {
      var vals = trend.map(function (e) { return e.value; });
      var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
      var range = max - min || 1;
      var w = 300, h = 90, pad = 6;
      var pts = trend.map(function (e, i) {
        var x = pad + (i / (trend.length - 1)) * (w - pad * 2);
        var y = h - pad - ((e.value - min) / range) * (h - pad * 2);
        return x.toFixed(1) + "," + y.toFixed(1);
      }).join(" ");
      svg = '<svg class="trend" viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none">' +
        '<polyline points="' + pts + '" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        "</svg>";
    }

    var rows = entries.slice(0, 15).map(function (e) {
      return '<div class="weight-list-row"><span>' + esc(fmtDate(e.date)) + '</span><span>' + esc(e.value) +
        ' &nbsp; <span class="del" data-action="delete-weight" data-id="' + e.id + '">delete</span></span></div>';
    }).join("");

    return (
      '<div class="topbar"><button class="back-btn" data-action="home">&larr; Home</button><h1>Body weight</h1><span></span></div>' +
      '<div class="date-field"><span>Date</span><input type="date" id="weight-date" value="' + todayStr() + '"></div>' +
      '<div class="weight-input-row">' +
        '<input type="number" step="0.1" id="weight-value" placeholder="' + (latest ? esc(latest.value) : "weight") + '">' +
      "</div>" +
      '<div class="placeholder-hint">' + (latest ? "Last: " + esc(latest.value) + " on " + esc(fmtDate(latest.date)) : "No entries yet") + "</div>" +
      '<button class="primary-btn" data-action="save-weight">Save</button>' +
      svg +
      '<div class="section"><div class="section-title">History</div>' + (rows || '<div class="empty">No entries yet</div>') + "</div>"
    );
  }

  function viewSettings() {
    return (
      '<div class="topbar"><button class="back-btn" data-action="home">&larr; Home</button><h1>Settings</h1><span></span></div>' +
      '<div class="settings-section">' +
        '<div class="section-title">Backup</div>' +
        "<p>Your data lives only on this device&rsquo;s browser storage. Export a backup file occasionally, especially before clearing browser data or switching phones.</p>" +
        '<button class="secondary-btn" data-action="export-data">Export backup (.json)</button>' +
        '<input type="file" id="import-file" accept="application/json" style="display:none">' +
        '<button class="secondary-btn" data-action="import-data">Import backup</button>' +
      "</div>" +
      '<div class="settings-section">' +
        '<div class="section-title">Danger zone</div>' +
        "<p>Erases all workouts and weight entries on this device. Cannot be undone.</p>" +
        '<button class="danger-btn" data-action="clear-data">Clear all data</button>' +
      "</div>"
    );
  }

  // ---------------- Render dispatch ----------------

  function render() {
    var v = state.view;
    var html;
    if (v.name === "home") html = viewHome();
    else if (v.name === "log") html = viewLog(v.params.routine);
    else if (v.name === "routine-history") html = viewRoutineHistory(v.params.routine);
    else if (v.name === "history-picker") html = viewHistoryPicker();
    else if (v.name === "progress") html = viewProgress();
    else if (v.name === "progress-routine") html = viewProgressRoutine(v.params.routine);
    else if (v.name === "progress-exercise") html = viewProgressExercise(v.params.routine, v.params.exercise);
    else if (v.name === "weight") html = viewWeight();
    else if (v.name === "settings") html = viewSettings();
    else html = viewHome();
    app.innerHTML = html;
  }

  // ---------------- Actions ----------------

  function saveSession(routineId) {
    var routine = data.routines[routineId];
    var dateEl = document.getElementById("log-date");
    var date = dateEl.value || todayStr();
    var blocks = document.querySelectorAll('#exercise-list .exercise-block');
    var entries = [];
    blocks.forEach(function (block) {
      var exName = block.getAttribute("data-exercise");
      var sets = [];
      block.querySelectorAll(".set-box").forEach(function (box) {
        var wVal = box.querySelector(".set-weight").value;
        var rVal = box.querySelector(".set-reps").value;
        if (wVal !== "") sets.push({ weight: parseFloat(wVal), reps: rVal !== "" ? parseInt(rVal, 10) : null });
      });
      var note = block.querySelector(".exercise-note").value.trim();
      if (sets.length || note) {
        var entry = { exercise: exName, sets: sets };
        if (note) entry.note = note;
        entries.push(entry);
      }
    });
    var note = document.getElementById("session-note").value.trim();

    var existingIdx = data.sessions.findIndex(function (s) { return s.routineId === routineId && s.date === date; });
    var session = { id: existingIdx >= 0 ? data.sessions[existingIdx].id : uid("ss"), date: date, routineId: routineId, entries: entries };
    if (note) session.note = note;

    if (existingIdx >= 0) data.sessions[existingIdx] = session;
    else data.sessions.push(session);

    // keep routine template in sync with any exercises typed on this log
    entries.forEach(function (e) {
      if (routine.exercises.indexOf(e.exercise) === -1) routine.exercises.push(e.exercise);
    });

    save();
    toast("Saved");
    go("log", { routine: routineId });
  }

  function addExercise(routineId) {
    var input = document.getElementById("new-exercise-name");
    var name = input.value.trim();
    if (!name) return;
    var routine = data.routines[routineId];
    if (routine.exercises.indexOf(name) === -1) {
      routine.exercises.push(name);
      save();
    }
    go("log", { routine: routineId });
  }

  function deleteSession(id) {
    if (!confirm("Delete this session? This can't be undone.")) return;
    var s = data.sessions.find(function (s) { return s.id === id; });
    data.sessions = data.sessions.filter(function (s) { return s.id !== id; });
    save();
    toast("Deleted");
    render();
    if (s) go("routine-history", { routine: s.routineId });
  }

  function saveWeight() {
    var val = document.getElementById("weight-value").value;
    var date = document.getElementById("weight-date").value || todayStr();
    if (!val) { toast("Enter a weight"); return; }
    var existingIdx = data.bodyWeight.findIndex(function (w) { return w.date === date; });
    var entry = { id: existingIdx >= 0 ? data.bodyWeight[existingIdx].id : uid("sw"), date: date, value: parseFloat(val) };
    if (existingIdx >= 0) data.bodyWeight[existingIdx] = entry;
    else data.bodyWeight.push(entry);
    save();
    toast("Saved");
    go("weight");
  }

  function deleteWeight(id) {
    data.bodyWeight = data.bodyWeight.filter(function (w) { return w.id !== id; });
    save();
    go("weight");
  }

  function exportData() {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "gym-tracker-backup-" + todayStr() + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast("Backup downloaded");
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        if (!parsed.routines || !parsed.sessions) throw new Error("bad format");
        if (!confirm("Import will replace all current data on this device. Continue?")) return;
        data = parsed;
        save();
        toast("Import complete");
        go("home");
      } catch (e) {
        alert("That file doesn't look like a Gym Tracker backup.");
      }
    };
    reader.readAsText(file);
  }

  function clearData() {
    if (!confirm("This deletes every workout and weight entry on this device. Continue?")) return;
    if (!confirm("Are you sure? This cannot be undone.")) return;
    data = { version: 2, routines: JSON.parse(JSON.stringify(SEED_DATA.routines)), bodyWeight: [], sessions: [] };
    save();
    toast("All data cleared");
    go("home");
  }

  app.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");
    var routine = el.getAttribute("data-routine");
    var id = el.getAttribute("data-id");
    var exercise = el.getAttribute("data-exercise");

    if (action === "home") go("home");
    else if (action === "open-log") go("log", { routine: routine });
    else if (action === "open-routine-history") go("routine-history", { routine: routine });
    else if (action === "open-history-picker") go("history-picker");
    else if (action === "open-progress") go("progress");
    else if (action === "open-progress-routine") go("progress-routine", { routine: routine });
    else if (action === "open-progress-exercise") go("progress-exercise", { routine: routine, exercise: exercise });
    else if (action === "open-weight") go("weight");
    else if (action === "open-settings") go("settings");
    else if (action === "save-session") saveSession(routine);
    else if (action === "add-exercise") addExercise(routine);
    else if (action === "delete-session") deleteSession(id);
    else if (action === "save-weight") saveWeight();
    else if (action === "delete-weight") deleteWeight(id);
    else if (action === "export-data") exportData();
    else if (action === "import-data") document.getElementById("import-file").click();
    else if (action === "clear-data") clearData();
  });

  app.addEventListener("change", function (e) {
    if (e.target && e.target.id === "import-file" && e.target.files[0]) {
      importData(e.target.files[0]);
    }
  });

  render();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        // Force a fresh check every load instead of waiting on the browser's
        // own update heuristics, which can lag for a long time on some
        // mobile browsers (notably installed iOS home-screen apps).
        reg.update().catch(function () {});
      }).catch(function () { /* offline support is best-effort */ });
    });
    // If a new service worker takes over mid-session, reload once so the
    // page picks up the new files instead of continuing to run stale code.
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (window.__gtReloaded) return;
      window.__gtReloaded = true;
      location.reload();
    });
  }
})();
