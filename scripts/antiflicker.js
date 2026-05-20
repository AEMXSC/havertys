/* eslint-disable */
// antiflicker.js
export function antiFlicker() {
    const scriptTag = document.createElement('script');
    scriptTag.innerHTML = `
    try {
        function TargetFlickerConfig(pathRegex, domainList, cssSelectorList, preHideFunction, postHideFunction, timeout) {
            this.pathRegex = pathRegex;
            this.domainList = domainList;
            this.cssSelectorList = cssSelectorList;
            this.preHideFunction = preHideFunction;
            this.postHideFunction = postHideFunction;
            this.timeout = timeout;
        }

        const targetFlickerConfigList = [
            new TargetFlickerConfig(
                /^\\/$/,
                ['http://www.havertys.com'],
                ['body'],
                null,
                null,
                10000
            ),
        ];

        const isNotVEC = document.location.href.indexOf("adobe_authoring_enabled") === -1;
        const targetFlickerConfigMatchList = targetFlickerConfigList.filter(config => {
            return config.pathRegex.test(window.location.pathname) && (!config.domainList.length || config.domainList.some((domain) => window.location.host === domain)); 
        });

        if (isNotVEC) {
            targetFlickerConfigMatchList.forEach(targetFlickerConfigMatch => {
                (function (win, doc, targetFlickerConfig, hideStyle) {
                    const STYLE_ID = 'at-body-style';

                    function addStyle(parent, id, def) {
                        if (!parent) return;
                        if (!doc.querySelector(\`#\${id}\`)) {
                            const styleElement = doc.createElement('style');
                            styleElement.id = id;
                            styleElement.innerHTML = def;
                            parent.appendChild(styleElement); 
                        }
                    }

                    function removeStyle(parent, id) {
                        if (!parent) return;
                        const styleElement = doc.getElementById(id);
                        if (styleElement) { parent.removeChild(styleElement); }
                    }

                    function doAntiFlicker() {
                        targetFlickerConfig.preHideFunction && targetFlickerConfig.preHideFunction.call(win, doc, targetFlickerConfig);
                        const cssJoin = targetFlickerConfig.cssSelectorList.join(",");
                        addStyle(doc.head, STYLE_ID, \`\`);
                    }

                    function undoAntiFlicker() {
                        removeStyle(doc.head, STYLE_ID);
                        targetFlickerConfig.postHideFunction && targetFlickerConfig.postHideFunction.call(win, doc, targetFlickerConfig);
                    }

                    doAntiFlicker();
                    ['at-content-rendering-succeeded', 'at-request-failed', 'at-content-rendering-failed'].forEach(function (e) {
                        document.addEventListener(e, function (event) { undoAntiFlicker(); }, false); 
                    });

                    setTimeout(function () {
                        undoAntiFlicker(); 
                    }, targetFlickerConfig.timeout);

                }(window, document, targetFlickerConfigMatch, '{opacity: 0 !important}'));
            });
        }
    } catch (e) { console.log(e); }
    `;

    document.head.appendChild(scriptTag);
}
