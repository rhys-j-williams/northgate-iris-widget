// IRIS-0900 host verification probe. Loaded by retail-web-host.html after the host's zone.js and
// before the widget bundle. Records what the host page can observe and writes the verdict into
// <pre id="log"> and body[data-iris-host-verified] for the headless driver to read.
(function () {
  var lines = [];
  var errors = [];
  function say(s) {
    lines.push(s);
    var log = document.getElementById('log');
    if (log) log.textContent = lines.join('\n');
  }
  window.addEventListener('error', function (e) {
    errors.push(e.message);
    say('window.onerror: ' + e.message);
  });
  window.addEventListener('securitypolicyviolation', function (e) {
    say('csp violation: ' + e.violatedDirective + ' blocked ' + e.blockedURI);
  });

  var hostZone = typeof Zone !== 'undefined' ? Zone : undefined;
  say('host zone present before bundle: ' + !!hostZone);
  say('host zone flags: UNPATCHED_EVENTS=' + JSON.stringify(window.__zone_symbol__UNPATCHED_EVENTS) +
    ' disable_requestAnimationFrame=' + window.__Zone_disable_requestAnimationFrame);

  window.addEventListener('DOMContentLoaded', function () {
    customElements.whenDefined('northgate-iris-widget').then(function () {
      say('customElements.define fired for northgate-iris-widget');
      setTimeout(function () {
        var el = document.querySelector('#iris-root > northgate-iris-widget');
        var root = el && el.querySelector('.iris-root');
        var launcher = el && el.querySelector('.iris-launcher');
        var panel = el && el.querySelector('#iris-panel');
        var sameZone = typeof Zone !== 'undefined' && Zone === hostZone;
        var zoneAlreadyLoaded = errors.some(function (m) { return /Zone already loaded/i.test(m); });
        say('rendered .iris-root inside #iris-root: ' + !!root);
        say('rendered launcher: ' + !!launcher);
        say('rendered open panel: ' + !!panel);
        say('window.Zone is still the host Zone object after bundle: ' + sameZone);
        say('"Zone already loaded" error seen: ' + zoneAlreadyLoaded);
        say('script errors: ' + errors.length);
        var ok = !!(root && launcher && panel) && sameZone && !zoneAlreadyLoaded && errors.length === 0;
        document.body.setAttribute('data-iris-host-verified', ok ? 'true' : 'false');
        say(ok ? 'HOST-VERIFIED' : 'HOST-FAILED');
      }, 500);
    });
    setTimeout(function () {
      if (!document.body.hasAttribute('data-iris-host-verified')) {
        say('timeout: element never defined');
        document.body.setAttribute('data-iris-host-verified', 'false');
        say('HOST-FAILED');
      }
    }, 8000);
  });
})();
