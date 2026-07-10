(function () {
  "use strict";

  var STORAGE_KEY = "gymTrackerData";
  var app = document.getElementById("app");
  var state = { view: { name: "home" } };
  var data = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
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

  function lastTextFor(routineId, exercise) {
    var list = sessionsFor(routineId);
    for (var i = 0; i < list.length; i++) {
      var entry = list[i].entries.find(function (e) { return e.exercise === exercise; });
      if (entry) return { text: entry.text, date: list[i].date };
    }
    return null;
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
        '<button class="secondary-btn" data-action="open-history-picker">View history</button>' +
      "</div>" +
      '<div class="settings-link" data-action="open-settings">Settings &amp; backup</div>'
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
      var last = lastTextFor(routineId, ex);
      var prefillText = prefillEntry ? prefillEntry.text : (last ? last.text : "");
      var hint = last ? "last " + fmtDate(last.date) : "not logged before";
      return (
        '<div class="exercise-block" data-exercise="' + esc(ex) + '">' +
          '<div class="field-row"><label>' + esc(ex) + "</label>" +
            '<span class="last-value">' + esc(hint) + "</span></div>" +
          '<input type="text" inputmode="text" data-role="exercise-input" value="' + esc(prefillText) + '">' +
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
        return '<div class="row"><span class="ex">' + esc(e.exercise) + '</span><span class="val">' + esc(e.text) + "</span></div>";
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
      var input = block.querySelector('[data-role="exercise-input"]');
      var text = input.value.trim();
      if (text) entries.push({ exercise: exName, text: text });
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
    data = { version: 1, routines: JSON.parse(JSON.stringify(SEED_DATA.routines)), bodyWeight: [], sessions: [] };
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

    if (action === "home") go("home");
    else if (action === "open-log") go("log", { routine: routine });
    else if (action === "open-routine-history") go("routine-history", { routine: routine });
    else if (action === "open-history-picker") go("history-picker");
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
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline support is best-effort */ });
    });
  }
})();
