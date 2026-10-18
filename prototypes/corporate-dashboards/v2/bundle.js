/* Opsell status language. Plain script, no dependencies: window.Opsell.{STATUS, TONES, icon, chip, cell, tile} return HTML strings styled by bundle.css. */
(function () {
  var ICONS = {"circle-dashed":"<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\" /><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\" /><path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\" /><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\" /><path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\" /><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\" /><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\" /><path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\" />","circle-check":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m9 12 2 2 4-4\" />","history":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" /><path d=\"M12 7v5l4 2\" />","clock-alert":"<path d=\"M12 6v6l4 2\" /><path d=\"M16 21.16a10 10 0 1 1 5-13.516\" /><path d=\"M20 11.5v6\" /><path d=\"M20 21.5h.01\" />","circle-minus":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M8 12h8\" />","pen-line":"<path d=\"M12 20h9\" /><path d=\"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z\" />","lock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /><path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />","lock-open":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /><path d=\"M7 11V7a5 5 0 0 1 9.9-1\" />","circle-off":"<path d=\"m2 2 20 20\" /><path d=\"M8.35 2.69A10 10 0 0 1 21.3 15.65\" /><path d=\"M19.08 19.08A10 10 0 1 1 4.92 4.92\" />","flag":"<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\" /><line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\" />","octagon-alert":"<path d=\"M12 16h.01\" /><path d=\"M12 8v4\" /><path d=\"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z\" />","triangle-alert":"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /><path d=\"M12 9v4\" /><path d=\"M12 17h.01\" />","info":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M12 16v-4\" /><path d=\"M12 8h.01\" />","hourglass":"<path d=\"M5 22h14\" /><path d=\"M5 2h14\" /><path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\" /><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\" />","send":"<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\" /><path d=\"m21.854 2.147-10.94 10.939\" />","signature":"<path d=\"m21 17-2.156-1.868A.5.5 0 0 0 18 15.5v.5a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1c0-2.545-3.991-3.97-8.5-4a1 1 0 0 0 0 5c4.153 0 4.745-11.295 5.708-13.5a2.5 2.5 0 1 1 3.31 3.284\" /><path d=\"M3 21h18\" />","circle-x":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m15 9-6 6\" /><path d=\"m9 9 6 6\" />","ban":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"m4.9 4.9 14.2 14.2\" />","file-clock":"<path d=\"M16 22h2a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3\" /><path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /><circle cx=\"8\" cy=\"16\" r=\"6\" /><path d=\"M9.5 17.5 8 16.25V14\" />","timer-off":"<path d=\"M10 2h4\" /><path d=\"M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7\" /><path d=\"M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2\" /><path d=\"m2 2 20 20\" /><path d=\"M12 12v-2\" />","unplug":"<path d=\"m19 5 3-3\" /><path d=\"m2 22 3-3\" /><path d=\"M6.3 20.3a2.4 2.4 0 0 0 3.4 0L12 18l-6-6-2.3 2.3a2.4 2.4 0 0 0 0 3.4Z\" /><path d=\"M7.5 13.5 10 11\" /><path d=\"M10.5 16.5 13 14\" /><path d=\"m12 6 6 6 2.3-2.3a2.4 2.4 0 0 0 0-3.4l-2.6-2.6a2.4 2.4 0 0 0-3.4 0Z\" />","chevron-right":"<path d=\"m9 18 6-6-6-6\" />","store":"<path d=\"m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7\" /><path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\" /><path d=\"M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4\" /><path d=\"M2 7h20\" /><path d=\"M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7\" />","bandage":"<path d=\"M10 10.01h.01\" /><path d=\"M10 14.01h.01\" /><path d=\"M14 10.01h.01\" /><path d=\"M14 14.01h.01\" /><path d=\"M18 6v11.5\" /><path d=\"M6 6v12\" /><rect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"2\" />","timer":"<line x1=\"10\" x2=\"14\" y1=\"2\" y2=\"2\" /><line x1=\"12\" x2=\"15\" y1=\"14\" y2=\"11\" /><circle cx=\"12\" cy=\"14\" r=\"8\" />","coins":"<circle cx=\"8\" cy=\"8\" r=\"6\" /><path d=\"M18.09 10.37A6 6 0 1 1 10.34 18\" /><path d=\"M7 6h1v4\" /><path d=\"m16.71 13.88.7.71-2.82 2.82\" />","house":"<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\" /><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\" />","clipboard-check":"<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /><path d=\"m9 14 2 2 4-4\" />","chart-column":"<path d=\"M3 3v16a2 2 0 0 0 2 2h16\" /><path d=\"M18 17V9\" /><path d=\"M13 17V5\" /><path d=\"M8 17v-3\" />","file-pen-line":"<path d=\"m18 5-2.414-2.414A2 2 0 0 0 14.172 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2\" /><path d=\"M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z\" /><path d=\"M8 18h1\" />","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /><path d=\"M16 3.13a4 4 0 0 1 0 7.75\" />","hand-coins":"<path d=\"M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17\" /><path d=\"m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\" /><path d=\"m2 16 6 6\" /><circle cx=\"16\" cy=\"9\" r=\"2.9\" /><circle cx=\"6\" cy=\"5\" r=\"3\" />","settings":"<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\" /><circle cx=\"12\" cy=\"12\" r=\"3\" />","search":"<circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" />","bell":"<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\" /><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\" />","loader-circle":"<path d=\"M21 12a9 9 0 1 1-6.219-8.56\" />","chevrons-up-down":"<path d=\"m7 15 5 5 5-5\" /><path d=\"m7 9 5-5 5 5\" />","panel-left":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" /><path d=\"M9 3v18\" />","log-out":"<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" /><polyline points=\"16 17 21 12 16 7\" /><line x1=\"21\" x2=\"9\" y1=\"12\" y2=\"12\" />","sun":"<circle cx=\"12\" cy=\"12\" r=\"4\" /><path d=\"M12 2v2\" /><path d=\"M12 20v2\" /><path d=\"m4.93 4.93 1.41 1.41\" /><path d=\"m17.66 17.66 1.41 1.41\" /><path d=\"M2 12h2\" /><path d=\"M20 12h2\" /><path d=\"m6.34 17.66-1.41 1.41\" /><path d=\"m19.07 4.93-1.41 1.41\" />","moon":"<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\" />","monitor":"<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\" /><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\" /><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\" />","keyboard":"<path d=\"M10 8h.01\" /><path d=\"M12 12h.01\" /><path d=\"M14 8h.01\" /><path d=\"M16 12h.01\" /><path d=\"M18 8h.01\" /><path d=\"M6 8h.01\" /><path d=\"M7 16h10\" /><path d=\"M8 12h.01\" /><rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" />","user":"<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /><circle cx=\"12\" cy=\"7\" r=\"4\" />","arrow-up":"<path d=\"m5 12 7-7 7 7\" /><path d=\"M12 19V5\" />","arrow-down":"<path d=\"M12 5v14\" /><path d=\"m19 12-7 7-7-7\" />","arrow-up-down":"<path d=\"m21 16-4 4-4-4\" /><path d=\"M17 20V4\" /><path d=\"m3 8 4-4 4 4\" /><path d=\"M7 4v16\" />","ellipsis":"<circle cx=\"12\" cy=\"12\" r=\"1\" /><circle cx=\"19\" cy=\"12\" r=\"1\" /><circle cx=\"5\" cy=\"12\" r=\"1\" />","x":"<path d=\"M18 6 6 18\" /><path d=\"m6 6 12 12\" />","check":"<path d=\"M20 6 9 17l-5-5\" />","minus":"<path d=\"M5 12h14\" />","calendar":"<path d=\"M8 2v4\" /><path d=\"M16 2v4\" /><rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /><path d=\"M3 10h18\" />","inbox":"<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\" /><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\" />","trash-2":"<path d=\"M3 6h18\" /><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\" /><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\" /><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\" /><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\" />","rotate-ccw":"<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\" /><path d=\"M3 3v5h5\" />","download":"<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /><polyline points=\"7 10 12 15 17 10\" /><line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\" />","filter":"<polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\" />","external-link":"<path d=\"M15 3h6v6\" /><path d=\"M10 14 21 3\" /><path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\" />","chevron-left":"<path d=\"m15 18-6-6 6-6\" />","chevron-down":"<path d=\"m6 9 6 6 6-6\" />","chevron-up":"<path d=\"m18 15-6-6-6 6\" />","circle-alert":"<circle cx=\"12\" cy=\"12\" r=\"10\" /><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />","plus":"<path d=\"M5 12h14\" /><path d=\"M12 5v14\" />","mail":"<rect width=\"20\" height=\"16\" x=\"2\" y=\"4\" rx=\"2\" /><path d=\"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7\" />","arrow-right":"<path d=\"M5 12h14\" /><path d=\"m12 5 7 7-7 7\" />","search-x":"<path d=\"m13.5 8.5-5 5\" /><path d=\"m8.5 8.5 5 5\" /><circle cx=\"11\" cy=\"11\" r=\"8\" /><path d=\"m21 21-4.3-4.3\" />","flask-conical":"<path d=\"M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2\" /><path d=\"M8.5 2h7\" /><path d=\"M7 16h10\" />","wifi-off":"<path d=\"M12 20h.01\" /><path d=\"M8.5 16.429a5 5 0 0 1 7 0\" /><path d=\"M5 12.859a10 10 0 0 1 5.17-2.69\" /><path d=\"M19 12.859a10 10 0 0 0-2.007-1.523\" /><path d=\"M2 8.82a15 15 0 0 1 4.177-2.643\" /><path d=\"M22 8.82a15 15 0 0 0-11.288-3.764\" /><path d=\"m2 2 20 20\" />","refresh-cw":"<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /><path d=\"M21 3v5h-5\" /><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /><path d=\"M8 16H3v5\" />","menu":"<line x1=\"4\" x2=\"20\" y1=\"12\" y2=\"12\" /><line x1=\"4\" x2=\"20\" y1=\"6\" y2=\"6\" /><line x1=\"4\" x2=\"20\" y1=\"18\" y2=\"18\" />","sliders-horizontal":"<line x1=\"21\" x2=\"14\" y1=\"4\" y2=\"4\" /><line x1=\"10\" x2=\"3\" y1=\"4\" y2=\"4\" /><line x1=\"21\" x2=\"12\" y1=\"12\" y2=\"12\" /><line x1=\"8\" x2=\"3\" y1=\"12\" y2=\"12\" /><line x1=\"21\" x2=\"16\" y1=\"20\" y2=\"20\" /><line x1=\"12\" x2=\"3\" y1=\"20\" y2=\"20\" /><line x1=\"14\" x2=\"14\" y1=\"2\" y2=\"6\" /><line x1=\"8\" x2=\"8\" y1=\"10\" y2=\"14\" /><line x1=\"16\" x2=\"16\" y1=\"18\" y2=\"22\" />","arrow-left":"<path d=\"m12 19-7-7 7-7\" /><path d=\"M19 12H5\" />"};
  var TONES = {
    quiet:    { label: 'Quiet',    use: 'In progress or not applicable. No color.' },
    done:     { label: 'Done',     use: 'Complete and fine. Neutral chip, green icon; collapses to quiet in dense grids.' },
    info:     { label: 'Info',     use: 'Worth knowing, no action due.' },
    warning:  { label: 'Warning',  use: 'Needs action soon.' },
    critical: { label: 'Critical', use: 'Act now. The only solid fill in grids.' }
  };
  var S = function (label, tone, icon, extra) { var o = { label: label, tone: tone, icon: icon }; if (extra) for (var k in extra) o[k] = extra[k]; return o; };
  var STATUS = {
    closingReport: { _name: 'Closing Report',
      draft:     S('Draft', 'quiet', 'circle-dashed', { when: 'Started, not submitted; before 10:00 the next morning.' }),
      submitted: S('Submitted', 'done', 'circle-check', { when: 'Submitted by 10:00.' }),
      late:      S('Late', 'warning', 'history', { when: 'Submitted after 10:00.' }),
      overdue:   S('Overdue', 'critical', 'clock-alert', { when: 'Not submitted and past 10:00.' }),
      closed:    S('Closed', 'quiet', 'circle-minus', { when: 'Location closed that Business Day; no report expected.' }),
      amended:   S('Amended', 'info', 'pen-line', { when: 'Changed after submission; previous version kept.' }) },
    tipDistribution: { _name: 'Tip Distribution',
      draft:     S('Draft', 'quiet', 'circle-dashed', { when: 'Split in progress.' }),
      finalized: S('Finalized', 'done', 'lock', { when: 'Locked; ready for payroll export.' }),
      reopened:  S('Reopened', 'warning', 'lock-open', { when: 'Unlocked after finalizing; must be finalized again before export.' }),
      noPool:    S('No pool', 'quiet', 'circle-off', { when: 'No tips that Business Day.' }) },
    hrFlag: { _name: 'HR Flag',
      open:      S('Open', 'warning', 'flag', { when: 'Waiting for HR to resolve.' }),
      urgent:    S('Urgent', 'critical', 'octagon-alert', { when: 'Workplace injury, open. Always first in Needs attention.' }),
      resolved:  S('Resolved', 'done', 'circle-check', { when: 'Closed by HR.' }) },
    writeUp: { _name: 'Write-up',
      draft:     S('Draft', 'quiet', 'circle-dashed', { when: 'Being written by the manager.' }),
      awaiting:  S('Awaiting HR approval', 'warning', 'hourglass', { when: 'Submitted to HR, not approved yet.' }),
      ready:     S('Ready to deliver', 'info', 'send', { when: 'Approved; manager to deliver to the Employee.' }),
      signed:    S('Signed', 'done', 'signature', { when: 'Delivered and signed by the Employee.' }),
      refused:   S('Refused', 'critical', 'circle-x', { when: 'Employee refused to sign; HR follows up.' }),
      voided:    S('Voided', 'quiet', 'ban', { when: 'Withdrawn; kept for the record.' }) },
    severity: { _name: 'Severity',
      critical:  S('Act today', 'critical', 'octagon-alert', { when: 'Act today: urgent HR Flag, Overdue report.' }),
      warning:   S('This week', 'warning', 'triangle-alert', { when: 'Act this week: labor over target, approval waiting.' }),
      info:      S('FYI', 'info', 'info', { when: 'Good to know: amended report, data caveat.' }) },
    dataQuality: { _name: 'Data quality',
      unapprovedTimesheets: S('Unapproved timesheets', 'info', 'file-clock', { kind: 'data', when: 'Labor figures may change once approved.' }),
      openPunch:            S('Open punch', 'warning', 'timer-off', { kind: 'data', when: 'An Employee never clocked out; labor is understated.' }),
      sourceUnavailable:    S('Source unavailable', 'warning', 'unplug', { kind: 'data', when: 'POS or payroll did not sync; figures are incomplete.' }) }
  };
  var SW = { 12: 2.6, 14: 2.4, 16: 2.25, 20: 1.8, 24: 1.5 };
  function icon(name, size) {
    size = size || 16;
    return '<svg class="op-icon" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (SW[size] || 1.5 * 24 / size) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  function get(domain, state) { var d = STATUS[domain]; var s = d && d[state]; if (!s) throw new Error('Unknown status ' + domain + '.' + state); return s; }
  function attrs(s) { return ' data-tone="' + s.tone + '"' + (s.kind ? ' data-kind="' + s.kind + '"' : ''); }
  function chip(domain, state, opts) {
    var s = get(domain, state), sm = opts && opts.size === 'sm';
    return '<span class="op-chip' + (sm ? ' op-chip--sm' : '') + '"' + attrs(s) + '>' + icon(s.icon, sm ? 12 : 14) + '<span>' + ((opts && opts.label) || s.label) + '</span></span>';
  }
  function cell(domain, state, opts) {
    var s = get(domain, state), sm = opts && opts.size === 'sm', t = (opts && opts.title) || s.label;
    return '<span class="op-cell' + (sm ? ' op-cell--sm' : '') + '"' + attrs(s) + ' role="img" aria-label="' + t + '" title="' + t + '">' + icon(s.icon, sm ? 12 : 16) + '</span>';
  }
  function tile(domain, state) { var s = get(domain, state); return '<span class="op-tile"' + attrs(s) + ' aria-hidden="true">' + icon(s.icon, 16) + '</span>'; }

  /* Sparkline: values = current period, compare = same days a week earlier (dashed, chart-reference). */
  function spark(values, opts) {
    opts = opts || {}; var w = opts.width || 120, h = opts.height || 32, pad = 3, all = values.concat(opts.compare || []);
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all), rng = (mx - mn) || 1;
    var pts = function (arr) { return arr.map(function (v, i) { return [pad + i * (w - 2 * pad) / (arr.length - 1), h - pad - (v - mn) / rng * (h - 2 * pad)]; }); };
    var d = function (p) { return p.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(''); };
    var cur = pts(values), last = cur[cur.length - 1], out = '<svg class="op-spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">';
    if (opts.compare) out += '<path d="' + d(pts(opts.compare)) + '" fill="none" stroke="var(--chart-reference)" stroke-width="1.25" stroke-dasharray="2 3"/>';
    out += '<path d="' + d(cur) + '" fill="none" stroke="' + (opts.color || 'var(--accent-solid)') + '" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>';
    return out + '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.5" fill="' + (opts.color || 'var(--accent-solid)') + '"/></svg>';
  }
  function initials(name) { return name.split(/\s+/).map(function (p) { return p[0]; }).slice(0, 2).join('').toUpperCase(); }
  function avatar(name, size) { size = size || 28; return '<span class="op-avatar" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.39) + 'px" title="' + name + '">' + initials(name) + '</span>'; }
  function locTag(name, opts) { opts = opts || {}; return '<span class="op-loc' + (opts.removable ? ' op-loc--rm' : '') + '">' + icon('store', 12) + '<span>' + name + '</span>' + (opts.removable ? '<button class="op-loc-x" aria-label="Remove ' + name + '">' + icon('x', 12) + '</button>' : '') + '</span>'; }
  window.Opsell = { STATUS: STATUS, TONES: TONES, ICONS: ICONS, icon: icon, chip: chip, cell: cell, tile: tile, get: get, spark: spark, avatar: avatar, locTag: locTag };
})();

/* Opsell charts: SVG, token-driven, hover tooltips, click-through. window.Opsell.charts.* render into a container element. */
(function () {
  var O = window.Opsell;
  var NS = 'http://www.w3.org/2000/svg';

  /* ── Locations: fixed color + glyph, never by rank ── */
  var LOCATIONS = [
    { id: 'valencia', name: 'Valencia St', city: 'San Francisco, CA', color: 'var(--loc-valencia)', glyph: 'circle' },
    { id: 'lake',     name: 'Lake Ave',    city: 'Pasadena, CA',      color: 'var(--loc-lake)',     glyph: 'square' },
    { id: 'court',    name: 'Court St',    city: 'Brooklyn, NY',      color: 'var(--loc-court)',    glyph: 'triangle' },
    { id: 'mass',     name: 'Mass Ave',    city: 'Cambridge, MA',     color: 'var(--loc-mass)',     glyph: 'diamond' },
    { id: 'lamar',    name: 'South Lamar', city: 'Austin, TX',        color: 'var(--loc-lamar)',    glyph: 'cross' }
  ];
  function loc(nameOrId) { for (var i = 0; i < LOCATIONS.length; i++) if (LOCATIONS[i].id === nameOrId || LOCATIONS[i].name === nameOrId) return LOCATIONS[i]; return null; }

  /* ── Number formatting ── */
  function money(n, o) {
    o = o || {}; var s = n < 0 ? '−' : '', a = Math.abs(n);
    if (o.compact) {
      if (a >= 1e6) return s + '$' + trim(a / 1e6, a >= 1e7 ? 0 : 1) + 'M';
      if (a >= 1e3) return s + '$' + trim(a / 1e3, a >= 1e5 ? 0 : 1) + 'k';
      return s + '$' + Math.round(a);
    }
    return s + '$' + a.toLocaleString('en-US', { minimumFractionDigits: o.cents ? 2 : 0, maximumFractionDigits: o.cents ? 2 : 0 });
  }
  function trim(v, d) { var t = v.toFixed(d); return d ? t.replace(/\.0$/, '') : t; }
  function pct(n, d) { return n.toFixed(d == null ? 1 : d) + '%'; }
  function delta(n, unit, d) { var v = Math.abs(n).toFixed(d == null ? 1 : d); return (n > 0 ? '+' : n < 0 ? '−' : '±') + v + (unit === 'pts' ? ' pts' : unit === '' ? '' : '%'); }
  function count(n) { return Math.round(n).toLocaleString('en-US'); }
  var fmt = { money: money, pct: pct, delta: delta, count: count };

  /* ── Glyphs (secondary encoding for Locations) ── */
  function glyph(shape, x, y, r, fill, extra) {
    extra = extra || ''; var a = 'fill="' + fill + '" stroke="var(--surface-card)" stroke-width="2" ' + extra;
    if (shape === 'square') return '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + 2 * r + '" height="' + 2 * r + '" rx="1.5" ' + a + '/>';
    if (shape === 'triangle') return '<path d="M' + x + ' ' + (y - r * 1.2) + 'L' + (x + r * 1.1) + ' ' + (y + r * 0.8) + 'L' + (x - r * 1.1) + ' ' + (y + r * 0.8) + 'Z" stroke-linejoin="round" ' + a + '/>';
    if (shape === 'diamond') return '<path d="M' + x + ' ' + (y - r * 1.25) + 'L' + (x + r * 1.25) + ' ' + y + 'L' + x + ' ' + (y + r * 1.25) + 'L' + (x - r * 1.25) + ' ' + y + 'Z" stroke-linejoin="round" ' + a + '/>';
    if (shape === 'cross') { var w = r * 0.55; return '<path d="M' + (x - w) + ' ' + (y - r) + 'h' + 2 * w + 'v' + (r - w) + 'h' + (r - w) + 'v' + 2 * w + 'h-' + (r - w) + 'v' + (r - w) + 'h-' + 2 * w + 'v-' + (r - w) + 'h-' + (r - w) + 'v-' + 2 * w + 'h' + (r - w) + 'Z" ' + a + '/>'; }
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + a + '/>';
  }
  function key(color, shape, dashed) {
    if (shape) return '<svg width="12" height="12" aria-hidden="true">' + glyph(shape, 6, 6, 4.5, color).replace(/stroke="var\(--surface-card\)" stroke-width="2"/, 'stroke="none"') + '</svg>';
    return '<svg width="16" height="8" aria-hidden="true"><line x1="1" y1="4" x2="15" y2="4" stroke="' + color + '" stroke-width="2" stroke-linecap="round"' + (dashed ? ' stroke-dasharray="3 3"' : '') + '/></svg>';
  }
  function legend(items) { return '<div class="op-legend">' + items.map(function (i) { return '<span>' + (i.swatch ? '<i class="sw" style="background:' + i.color + '"></i>' : key(i.color, i.glyph, i.dashed)) + i.name + '</span>'; }).join('') + '</div>'; }

  /* ── Scales & ticks ── */
  function niceTicks(min, max, n) {
    var span = max - min || 1, step = Math.pow(10, Math.floor(Math.log10(span / n))), err = (span / n) / step;
    step *= err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
    var lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, t = [];
    for (var v = lo; v <= hi + step / 2; v += step) t.push(+v.toFixed(10));
    return t;
  }
  function scale(d0, d1, r0, r1) { return function (v) { return r0 + (v - d0) / (d1 - d0 || 1) * (r1 - r0); }; }

  /* ── Frame: svg + tooltip + resize ── */
  function frame(el, draw) {
    el.classList.add('op-chart');
    var tip = document.createElement('div'); tip.className = 'op-chart-tip'; tip.setAttribute('role', 'status');
    function render() {
      var w = Math.max(240, el.clientWidth);
      el.innerHTML = ''; var out = draw(w);
      el.insertAdjacentHTML('beforeend', out.html); el.appendChild(tip); tip.hidden = true;
      if (out.bind) out.bind(el.querySelector('svg.op-plot'), tip);
    }
    render();
    if (window.ResizeObserver) { var last = el.clientWidth; new ResizeObserver(function () { if (Math.abs(el.clientWidth - last) > 4) { last = el.clientWidth; render(); } }).observe(el); }
  }
  function showTip(tip, el, x, y, html) {
    tip.innerHTML = html; tip.hidden = false;
    var w = tip.offsetWidth, h = tip.offsetHeight, W = el.clientWidth;
    var left = x + 14 + w > W ? x - 14 - w : x + 14; tip.style.left = Math.max(0, left) + 'px'; tip.style.top = Math.max(0, y - h / 2) + 'px';
  }
  function tipRows(title, rows, foot) {
    return '<b>' + title + '</b>' + rows.map(function (r) { return '<span class="r">' + (r.key || '') + '<span class="n">' + r.name + '</span><span class="v">' + r.value + '</span></span>'; }).join('') + (foot ? '<span class="f">' + foot + '</span>' : '');
  }
  function clickable(svg, sel, fn) { if (!fn) return; svg.querySelectorAll(sel).forEach(function (n) { n.style.cursor = 'pointer'; n.addEventListener('click', function () { fn(+n.getAttribute('data-i'), n); }); n.setAttribute('tabindex', '0'); n.addEventListener('keydown', function (e) { if (e.key === 'Enter') fn(+n.getAttribute('data-i'), n); }); }); }

  /* ── Line / area with prior period ──
     opts: labels[], series[{name, values[], color, dashed, area, glyph, endLabel}], yFormat, yTicks, height, pendingFrom (index from which values are partial), gaps (null values break the line), onClick(i) */
  function line(el, o) {
    frame(el, function (W) {
      var H = o.height || 220, pl = 48, pr = o.endLabels ? 96 : 16, pt = 12, pb = 28, iw = W - pl - pr, ih = H - pt - pb;
      var all = []; o.series.forEach(function (s) { s.values.forEach(function (v) { if (v != null) all.push(v); }); });
      var lo = o.yMin != null ? o.yMin : Math.min.apply(null, all), hi = Math.max.apply(null, all);
      var ticks = niceTicks(o.zero ? 0 : lo - (hi - lo) * 0.1, hi, 4), y = scale(ticks[0], ticks[ticks.length - 1], pt + ih, pt), n = o.labels.length, x = function (i) { return pl + (n === 1 ? iw / 2 : i * iw / (n - 1)); };
      var f = o.yFormat || function (v) { return v; };
      var h = '<svg class="op-plot" width="' + W + '" height="' + H + '" role="img" aria-label="' + (o.title || '') + '"><defs><pattern id="hatch-' + el.id + '" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--chart-prior)" stroke-width="1.5"/></pattern></defs>';
      ticks.forEach(function (t, i) { h += '<line class="grid" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(t) + '" y2="' + y(t) + '"' + (i === 0 ? ' style="stroke:var(--chart-axis)"' : '') + '/><text class="ax" x="' + (pl - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + f(t) + '</text>'; });
      var every = Math.ceil(n / (iw / 64));
      o.labels.forEach(function (l, i) { if (i % every === 0 || i === n - 1) h += '<text class="ax" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + l + '</text>'; });
      if (o.pendingFrom != null) { var px = x(o.pendingFrom - 0.5); h += '<rect x="' + px + '" y="' + pt + '" width="' + (W - pr - px) + '" height="' + ih + '" fill="url(#hatch-' + el.id + ')" opacity=".35"/><text class="ax" x="' + (W - pr - 4) + '" y="' + (pt + 12) + '" text-anchor="end">' + (o.pendingLabel || 'Pending') + '</text>'; }
      if (o.target != null) h += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(o.target) + '" y2="' + y(o.target) + '" stroke="var(--chart-target)" stroke-dasharray="4 3"/>' + (o.endLabels ? '' : '<text class="ax tgt" x="' + (W - pr - 4) + '" y="' + (y(o.target) - 6) + '" text-anchor="end">' + (o.targetLabel || 'Target ' + f(o.target)) + '</text>');
      var ends = [];
      o.series.slice().reverse().forEach(function (s) {
        var segs = [], cur = [];
        s.values.forEach(function (v, i) { if (v == null) { if (cur.length) segs.push(cur); cur = []; } else cur.push([x(i), y(v), i]); });
        if (cur.length) segs.push(cur);
        segs.forEach(function (seg) {
          var d = seg.map(function (p, j) { return (j ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('');
          if (s.area) h += '<path d="' + d + 'L' + seg[seg.length - 1][0] + ' ' + (pt + ih) + 'L' + seg[0][0] + ' ' + (pt + ih) + 'Z" fill="var(--chart-area)"/>';
          h += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="' + (s.dashed ? 1.5 : 2) + '"' + (s.dashed ? ' stroke-dasharray="4 4"' : '') + ' stroke-linejoin="round" stroke-linecap="round"/>';
        });
        if (!s.dashed) { var li = s.values.length - 1; while (li >= 0 && s.values[li] == null) li--; if (li >= 0) {
          var pending = o.pendingFrom != null && li >= o.pendingFrom;
          h += s.glyph ? glyph(s.glyph, x(li), y(s.values[li]), 4.5, s.color) : '<circle cx="' + x(li) + '" cy="' + y(s.values[li]) + '" r="4" fill="' + (pending ? 'var(--surface-card)' : s.color) + '" stroke="' + (pending ? s.color : 'var(--surface-card)') + '" stroke-width="2"/>';
          if (o.endLabels) ends.push({ y: y(s.values[li]), x: x(li), name: s.name });
        } }
      });
      if (o.endLabels && o.target != null) ends.push({ y: y(o.target), x: W - pr, name: o.targetLabel || 'Target ' + f(o.target), tgt: true });
      ends.sort(function (a, b) { return a.y - b.y; });
      for (var e = 1; e < ends.length; e++) if (ends[e].y - ends[e - 1].y < 15) ends[e].y = ends[e - 1].y + 15;
      ends.forEach(function (e) { h += '<text class="' + (e.tgt ? 'ax tgt' : 'lbl') + '" x="' + (e.x + 10) + '" y="' + (e.y + 4) + '">' + e.name + '</text>'; });
      h += '<line class="xhair" x1="0" x2="0" y1="' + pt + '" y2="' + (pt + ih) + '" visibility="hidden"/><g class="dots"></g>';
      for (var i = 0; i < n; i++) h += '<rect class="hit" data-i="' + i + '" x="' + (x(i) - iw / (n - 1 || 1) / 2) + '" y="' + pt + '" width="' + (iw / (n - 1 || 1)) + '" height="' + ih + '" fill="transparent"/>';
      h += '</svg>';
      return { html: (o.legend === false ? '' : legend(o.series.map(function (s) { return { name: s.name, color: s.color, dashed: s.dashed, glyph: s.glyph }; }))) + h, bind: function (svg, tip) {
        var xh = svg.querySelector('.xhair'), dots = svg.querySelector('.dots');
        svg.querySelectorAll('.hit').forEach(function (r) {
          var i = +r.getAttribute('data-i');
          function on() {
            xh.setAttribute('x1', x(i)); xh.setAttribute('x2', x(i)); xh.setAttribute('visibility', 'visible');
            var rows = o.series.filter(function (s) { return s.values[i] != null; });
            dots.innerHTML = rows.map(function (s) { return s.glyph ? glyph(s.glyph, x(i), y(s.values[i]), 4.5, s.color) : '<circle cx="' + x(i) + '" cy="' + y(s.values[i]) + '" r="4" fill="' + (s.dashed ? 'var(--surface-card)' : s.color) + '" stroke="' + (s.dashed ? s.color : 'var(--surface-card)') + '" stroke-width="2"/>'; }).join('');
            rows.sort(function (a, b) { return b.values[i] - a.values[i]; });
            showTip(tip, el, x(i), y(rows.length ? rows[0].values[i] : 0) + svg.getBoundingClientRect().top - el.getBoundingClientRect().top,
              tipRows((o.tipLabels || o.labels)[i], rows.map(function (s) { return { key: key(s.color, s.glyph, s.dashed), name: s.name, value: f(s.values[i]) }; }), o.tipFoot ? o.tipFoot(i) : (o.onClick ? 'Click to open' : '')));
          }
          r.addEventListener('mouseenter', on); r.addEventListener('focus', on);
          r.addEventListener('mouseleave', function () { xh.setAttribute('visibility', 'hidden'); dots.innerHTML = ''; tip.hidden = true; });
        });
        clickable(svg, '.hit', o.onClick);
      } };
    });
  }

  /* ── Ordered horizontal bars with target ──
     opts: rows[{label, value, tone?}], target, format, max, sort ('desc'), onClick */
  function hbar(el, o) {
    var rows = o.rows.slice(); if (o.sort !== false) rows.sort(function (a, b) { return b.value - a.value; });
    frame(el, function (W) {
      var lw = o.labelWidth || 110, vw = 64, rh = 28, bh = 14, pt = o.target != null ? 20 : 4, H = pt + rows.length * rh + 4, iw = W - lw - vw;
      var max = o.max || Math.max.apply(null, rows.map(function (r) { return r.value; }).concat(o.target || 0)) * 1.05, x = scale(0, max, lw, lw + iw), f = o.format || pct;
      var h = '<svg class="op-plot" width="' + W + '" height="' + H + '" role="img" aria-label="' + (o.title || '') + '">';
      h += '<line x1="' + lw + '" x2="' + lw + '" y1="' + (pt - 2) + '" y2="' + (H - 2) + '" stroke="var(--chart-axis)"/>';
      rows.forEach(function (r, i) {
        var cy = pt + i * rh + rh / 2, bw = Math.max(2, x(r.value) - lw), fill = r.tone === 'warning' ? 'var(--warning-solid)' : r.tone === 'critical' ? 'var(--danger-solid)' : r.color || 'var(--neutral-400)';
        h += '<g class="bar" data-i="' + i + '"><rect x="0" y="' + (cy - rh / 2) + '" width="' + W + '" height="' + rh + '" fill="transparent"/>';
        h += '<text class="lbl" x="0" y="' + (cy + 4) + '">' + r.label + '</text>';
        h += '<path d="M' + lw + ' ' + (cy - bh / 2) + 'h' + (bw - 4) + 'a4 4 0 0 1 4 4v' + (bh - 8) + 'a4 4 0 0 1 -4 4h-' + (bw - 4) + 'Z" fill="' + fill + '"/>';
        h += '<text class="val" x="' + (lw + bw + 8) + '" y="' + (cy + 4) + '">' + (r.tone ? '▲ ' : '') + f(r.value) + '</text></g>';
      });
      if (o.target != null) { var tx = x(o.target); h += '<line x1="' + tx + '" x2="' + tx + '" y1="' + (pt - 6) + '" y2="' + (H - 2) + '" stroke="var(--chart-target)" stroke-width="1.5" stroke-dasharray="3 3"/><text class="ax tgt" x="' + tx + '" y="' + (pt - 9) + '" text-anchor="middle">' + (o.targetLabel || 'Target ' + f(o.target)) + '</text>'; }
      h += '</svg>';
      return { html: h, bind: function (svg, tip) {
        svg.querySelectorAll('.bar').forEach(function (g) { var r = rows[+g.getAttribute('data-i')];
          g.addEventListener('mouseenter', function (e) { g.classList.add('hov'); var bb = g.getBoundingClientRect(), eb = el.getBoundingClientRect(); showTip(tip, el, x(r.value), bb.top - eb.top + rh / 2, tipRows(r.label, [{ name: o.valueName || 'Value', value: f(r.value) }].concat(o.target != null ? [{ name: 'vs target', value: delta(r.value - o.target, 'pts') }] : []).concat(r.extra || []), o.onClick ? 'Click to open' : '')); });
          g.addEventListener('mouseleave', function () { g.classList.remove('hov'); tip.hidden = true; }); });
        clickable(svg, '.bar', o.onClick && function (i) { o.onClick(rows[i]); });
      } };
    });
  }

  /* ── Diverging bars around zero ──
     opts: rows[{label, value}], format, threshold (abs value beyond which a decline turns warning), unit, onClick */
  function diverging(el, o) {
    var rows = o.rows.slice().sort(function (a, b) { return b.value - a.value; });
    frame(el, function (W) {
      var lw = o.labelWidth || 110, rh = 28, bh = 14, pt = 18, H = pt + rows.length * rh + 4, iw = W - lw - 16;
      var m = Math.max.apply(null, rows.map(function (r) { return Math.abs(r.value); })) * 1.35, x = scale(-m, m, lw, lw + iw), z = x(0), f = o.format || function (v) { return delta(v, o.unit); };
      var h = '<svg class="op-plot" width="' + W + '" height="' + H + '" role="img" aria-label="' + (o.title || '') + '">';
      h += '<text class="ax" x="' + (z - 6) + '" y="10" text-anchor="end">← lower</text><text class="ax" x="' + (z + 6) + '" y="10">higher →</text>';
      rows.forEach(function (r, i) {
        var cy = pt + i * rh + rh / 2, xv = x(r.value), pos = r.value >= 0, bad = o.threshold != null && r.value <= -o.threshold;
        var fill = pos ? 'var(--chart-current)' : bad ? 'var(--warning-solid)' : 'var(--neutral-400)', w = Math.max(2, Math.abs(xv - z));
        var d = pos ? 'M' + z + ' ' + (cy - bh / 2) + 'h' + (w - 4) + 'a4 4 0 0 1 4 4v' + (bh - 8) + 'a4 4 0 0 1 -4 4h-' + (w - 4) + 'Z'
                    : 'M' + z + ' ' + (cy - bh / 2) + 'h-' + (w - 4) + 'a4 4 0 0 0 -4 4v' + (bh - 8) + 'a4 4 0 0 0 4 4h' + (w - 4) + 'Z';
        h += '<g class="bar" data-i="' + i + '"><rect x="0" y="' + (cy - rh / 2) + '" width="' + W + '" height="' + rh + '" fill="transparent"/><text class="lbl" x="0" y="' + (cy + 4) + '">' + r.label + '</text><path d="' + d + '" fill="' + fill + '"/>';
        h += '<text class="val" x="' + (pos ? xv + 8 : xv - 8) + '" y="' + (cy + 4) + '" text-anchor="' + (pos ? 'start' : 'end') + '">' + (bad ? '▼ ' : '') + f(r.value) + '</text></g>';
      });
      h += '<line x1="' + z + '" x2="' + z + '" y1="' + (pt - 4) + '" y2="' + (H - 2) + '" stroke="var(--chart-axis)" stroke-width="1.5"/></svg>';
      return { html: h, bind: function (svg, tip) {
        svg.querySelectorAll('.bar').forEach(function (g) { var r = rows[+g.getAttribute('data-i')];
          g.addEventListener('mouseenter', function () { g.classList.add('hov'); var bb = g.getBoundingClientRect(), eb = el.getBoundingClientRect(); showTip(tip, el, x(r.value), bb.top - eb.top + rh / 2, tipRows(r.label, (r.detail || [{ name: 'Change', value: f(r.value) }]), o.onClick ? 'Click to open' : '')); });
          g.addEventListener('mouseleave', function () { g.classList.remove('hov'); tip.hidden = true; }); });
        clickable(svg, '.bar', o.onClick && function (i) { o.onClick(rows[i]); });
      } };
    });
  }

  function inkFor(el, color) {
    var m = /var\((--[^)]+)\)/.exec(color), c = m ? getComputedStyle(el).getPropertyValue(m[1]).trim() : color;
    if (/^var\(/.test(c)) return inkFor(el, c);
    var h = c.replace('#', ''); if (h.length < 6) return 'var(--text-primary)';
    var l = [0, 2, 4].map(function (i) { var v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    var L = 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; return L > 0.22 ? '#0b0c0e' : '#ffffff';
  }

  /* ── Stacked horizontal bars (100% or absolute) ──
     opts: rows[{label, parts[]}], keys[{name, color}], percent (bool), format, onClick */
  function stacked(el, o) {
    frame(el, function (W) {
      var lw = o.labelWidth || 110, vw = o.percent ? 8 : 64, rh = 32, bh = 18, H = o.rows.length * rh + 4, iw = W - lw - vw;
      var tot = o.rows.map(function (r) { return r.parts.reduce(function (a, b) { return a + b; }, 0); }), max = o.percent ? 1 : Math.max.apply(null, tot);
      var h = '<svg class="op-plot" width="' + W + '" height="' + H + '" role="img" aria-label="' + (o.title || '') + '">';
      o.rows.forEach(function (r, i) {
        var cy = i * rh + rh / 2, x0 = lw, t = tot[i];
        h += '<text class="lbl" x="0" y="' + (cy + 4) + '">' + r.label + '</text>';
        r.parts.forEach(function (v, k) {
          var w = (o.percent ? v / t : v / max) * iw, last = k === r.parts.length - 1, gw = Math.max(0, w - (last ? 0 : 2));
          var d = last ? 'M' + x0 + ' ' + (cy - bh / 2) + 'h' + Math.max(0, gw - 4) + 'a4 4 0 0 1 4 4v' + (bh - 8) + 'a4 4 0 0 1 -4 4h-' + Math.max(0, gw - 4) + 'Z' : 'M' + x0 + ' ' + (cy - bh / 2) + 'h' + gw + 'v' + bh + 'h-' + gw + 'Z';
          h += '<path class="seg" data-i="' + i + '" data-k="' + k + '" d="' + d + '" fill="' + o.keys[k].color + '"/>';
          var share = v / t; if (o.inlineLabels && w > 44) h += '<text class="in" x="' + (x0 + gw / 2) + '" y="' + (cy + 4) + '" text-anchor="middle" style="fill:' + inkFor(el, o.keys[k].color) + '">' + Math.round(share * 100) + '%</text>';
          x0 += w;
        });
        if (!o.percent) h += '<text class="val" x="' + (x0 + 8) + '" y="' + (cy + 4) + '">' + (o.format || money)(t, { compact: true }) + '</text>';
      });
      h += '</svg>';
      return { html: legend(o.keys.map(function (k) { return { name: k.name, color: k.color, swatch: true }; })) + h, bind: function (svg, tip) {
        svg.querySelectorAll('.seg').forEach(function (p) { var i = +p.getAttribute('data-i'), k = +p.getAttribute('data-k'), r = o.rows[i], t = tot[i];
          p.addEventListener('mouseenter', function (e) { svg.querySelectorAll('.seg[data-i="' + i + '"]').forEach(function (q) { if (q !== p) q.style.opacity = .45; }); var eb = el.getBoundingClientRect(), bb = p.getBoundingClientRect();
            showTip(tip, el, bb.right - eb.left, bb.top - eb.top + bh / 2, tipRows(r.label + ' · ' + o.keys[k].name, [{ key: '<i class="sw" style="background:' + o.keys[k].color + '"></i>', name: 'Sales', value: money(r.parts[k]) }, { name: 'Share', value: pct(r.parts[k] / t * 100) }], o.onClick ? 'Click to open' : '')); });
          p.addEventListener('mouseleave', function () { svg.querySelectorAll('.seg').forEach(function (q) { q.style.opacity = ''; }); tip.hidden = true; }); });
        clickable(svg, '.seg', o.onClick);
      } };
    });
  }

  /* ── Columns (one value per Business Day) ──
     opts: labels[], values[] (null = no data), states[] ('pending' | 'reopened' | 'none' | null), format, average (draw a reference line), onClick */
  function columns(el, o) {
    frame(el, function (W) {
      var H = o.height || 200, pl = 48, pr = 12, pt = 18, pb = 28, iw = W - pl - pr, ih = H - pt - pb, n = o.values.length;
      var vals = o.values.filter(function (v) { return v != null; }), ticks = niceTicks(0, Math.max.apply(null, vals), 4), y = scale(0, ticks[ticks.length - 1], pt + ih, pt);
      var band = iw / n, bw = Math.min(24, band * 0.6), f = o.format || function (v) { return money(v, { compact: true }); };
      var h = '<svg class="op-plot" width="' + W + '" height="' + H + '" role="img" aria-label="' + (o.title || '') + '"><defs><pattern id="hatch-' + el.id + '" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="var(--chart-current)" stroke-width="1.5"/></pattern></defs>';
      ticks.forEach(function (t, i) { h += '<line class="grid" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(t) + '" y2="' + y(t) + '"' + (i === 0 ? ' style="stroke:var(--chart-axis)"' : '') + '/><text class="ax" x="' + (pl - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + f(t) + '</text>'; });
      if (o.average) { var av = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length; h += '<line x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y(av) + '" y2="' + y(av) + '" stroke="var(--chart-prior)" stroke-dasharray="4 4"/><text class="ax" x="' + (pl + 4) + '" y="' + (y(av) - 5) + '">Avg ' + f(av) + '</text>'; }
      o.values.forEach(function (v, i) {
        var cx = pl + band * i + band / 2, st = o.states && o.states[i];
        h += '<g class="col" data-i="' + i + '"><rect x="' + (cx - band / 2) + '" y="' + pt + '" width="' + band + '" height="' + ih + '" fill="transparent"/>';
        if (v == null || st === 'none') h += '<text class="ax" x="' + cx + '" y="' + (pt + ih - 6) + '" text-anchor="middle">—</text>';
        else {
          var top = y(v), hh = pt + ih - top, d = 'M' + (cx - bw / 2) + ' ' + (pt + ih) + 'v-' + (hh - 4) + 'a4 4 0 0 1 4 -4h' + (bw - 8) + 'a4 4 0 0 1 4 4v' + (hh - 4) + 'Z';
          var fill = st === 'pending' ? 'url(#hatch-' + el.id + ')' : st === 'reopened' ? 'var(--warning-solid)' : 'var(--chart-current)';
          h += '<path d="' + d + '" fill="' + fill + '"' + (st === 'pending' ? ' stroke="var(--chart-current)" stroke-width="1"' : '') + '/>';
          if (st === 'reopened') h += '<g transform="translate(' + (cx - 7) + ' ' + (top - 18) + ')" style="color:var(--warning-text)">' + O.icon('lock-open', 14).replace('<svg ', '<svg x="0" y="0" ') + '</g>';
        }
        if (i % Math.ceil(n / (iw / 40)) === 0 || i === n - 1) h += '<text class="ax" x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle">' + o.labels[i] + '</text>';
        h += '</g>';
      });
      h += '</svg>';
      return { html: h, bind: function (svg, tip) {
        svg.querySelectorAll('.col').forEach(function (g) { var i = +g.getAttribute('data-i'), v = o.values[i], st = o.states && o.states[i];
          g.addEventListener('mouseenter', function () { g.classList.add('hov'); var cx = pl + band * i + band / 2;
            var stLabel = st === 'pending' ? O.chip('tipDistribution', 'draft', { size: 'sm' }) : st === 'reopened' ? O.chip('tipDistribution', 'reopened', { size: 'sm' }) : st === 'none' ? O.chip('tipDistribution', 'noPool', { size: 'sm' }) : O.chip('tipDistribution', 'finalized', { size: 'sm' });
            showTip(tip, el, cx, v != null ? y(v) + 30 : pt + ih - 20, tipRows((o.tipLabels || o.labels)[i], [{ name: o.valueName || 'Value', value: v == null ? '—' : money(v) }].concat(o.extra ? o.extra(i) : []), stLabel)); });
          g.addEventListener('mouseleave', function () { g.classList.remove('hov'); tip.hidden = true; }); });
        clickable(svg, '.col', o.onClick);
      } };
    });
  }

  /* ── Calendar heatmap: Locations × Business Days ──
     mode 'status': cells[] are Closing Report states; mode 'seq': cells[] are numbers binned by opts.bins (5 edges → seq-1..5). */
  function heatmap(el, o) {
    el.classList.add('op-chart');
    var tip = document.createElement('div'); tip.className = 'op-chart-tip';
    var bins = o.bins || [27, 29, 31, 33];
    function bin(v) { var b = 1; for (var i = 0; i < bins.length; i++) if (v >= bins[i]) b = i + 2; return b; }
    var h = '<div class="op-heat" style="grid-template-columns:' + (o.labelWidth || 120) + 'px repeat(' + o.cols.length + ', 1fr)' + (o.summary ? ' 64px' : '') + '"><span></span>';
    o.cols.forEach(function (c, i) { h += '<span class="hd' + (i === o.cols.length - 1 ? ' today' : '') + '"><b>' + c[0] + '</b>' + c[1] + '</span>'; });
    if (o.summary) h += '<span class="hd sm">' + o.summary.title + '</span>';
    o.rows.forEach(function (r, ri) {
      var L = loc(r.label);
      h += '<span class="rl">' + (L ? key(L.color, L.glyph) : '') + r.label + '</span>';
      r.cells.forEach(function (v, ci) {
        if (o.mode === 'status') h += '<span class="hc" data-r="' + ri + '" data-c="' + ci + '">' + O.cell('closingReport', v, { title: r.label + ' · ' + o.colTitles[ci] + ' · ' + O.STATUS.closingReport[v].label }) + '</span>';
        else if (v == null) h += '<span class="hc" data-r="' + ri + '" data-c="' + ci + '"><span class="sq na" title="No data">—</span></span>';
        else { var b = bin(v); h += '<span class="hc" data-r="' + ri + '" data-c="' + ci + '"><span class="sq" style="background:var(--seq-' + b + ')' + (b >= 4 ? ';color:var(--text-inverse)' : '') + '">' + (v >= (o.flagAt || 99) ? '▲' : '') + '</span></span>'; }
      });
      if (o.summary) h += '<span class="sv">' + o.summary.value(r) + '</span>';
    });
    h += '</div>';
    if (o.mode !== 'status') h += '<div class="op-heat-scale"><span class="lbl">Labor % of sales</span>' + ['< ' + bins[0] + '%'].concat(bins.slice(0, -1).map(function (b, i) { return b + '–' + bins[i + 1] + '%'; })).concat(['≥ ' + bins[bins.length - 1] + '%']).map(function (t, i) { return '<span><i style="background:var(--seq-' + (i + 1) + ')"></i>' + t + '</span>'; }).join('') + '<span>▲ over ' + o.flagAt + '%</span></div>';
    el.innerHTML = h; el.appendChild(tip); tip.hidden = true;
    el.querySelectorAll('.hc').forEach(function (c) {
      var ri = +c.getAttribute('data-r'), ci = +c.getAttribute('data-c'), r = o.rows[ri], v = r.cells[ci];
      c.addEventListener('mouseenter', function () { var eb = el.getBoundingClientRect(), bb = c.getBoundingClientRect();
        showTip(tip, el, bb.right - eb.left - 6, bb.top - eb.top + bb.height / 2, tipRows(r.label + ' · ' + o.colTitles[ci],
          o.mode === 'status' ? [] : [{ name: 'Labor %', value: v == null ? '—' : pct(v) }, { name: 'vs target', value: v == null ? '—' : delta(v - (o.target || 27), 'pts') }],
          o.mode === 'status' ? O.chip('closingReport', v, { size: 'sm' }) : (o.onClick ? 'Click to open' : ''))); });
      c.addEventListener('mouseleave', function () { tip.hidden = true; });
      if (o.onClick) { c.style.cursor = 'pointer'; c.addEventListener('click', function () { o.onClick(r, ci); }); }
    });
  }

  O.LOCATIONS = LOCATIONS; O.loc = loc; O.fmt = fmt; O.glyph = glyph; O.legend = legend; O.seriesKey = key;
  O.charts = { line: line, hbar: hbar, diverging: diverging, stacked: stacked, columns: columns, heatmap: heatmap };
})();
