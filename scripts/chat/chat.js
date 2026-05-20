/* eslint-disable no-underscore-dangle */

import { getConfigValue } from '../configs.js';

const getGladlyEnv = () => {
  if (window.isProd) {
    return 'PROD';
  }
  return 'STAGING';
};

const loadInsideChat = async () => {
  (function loadScript(u, t, d) {
    const i = d.createElement(t);
    i.type = 'text/javascript';
    i.async = true;
    i.src = `//${u}`;
    const s = d.getElementsByTagName(t)[0];
    s.parentNode.insertBefore(i, s);
  })(await getConfigValue('chat-script-url'), 'script', document);
};

// https://developer.gladly.com/chat/Gladly.html
const loadGladlyChat = async () => {
  const gladlyEnv = getGladlyEnv();
  const gladlyAppId = await getConfigValue('chat-gladly-app-id');

  if (!gladlyAppId) {
    console.error('Gladly chat app ID is missing; skipping Gladly initialization.');
    return;
  }

  // prettier-ignore
  // eslint-disable-next-line
  !function(c,n,r,t){if(!c[r]){var i,d,p=[];d="PROD"!==t&&t?"STAGING"===t?"https://cdn.gladly.qa/gladly/chat-sdk/widget.js":t:"https://cdn.gladly.com/chat-sdk/widget.js",c[r]={init:function(){i=arguments;var e={then:function(t){return p.push({type:"t",next:t}),e},catch:function(t){return p.push({type:"c",next:t}),e}};return e}},c.__onHelpAppHostReady__=function(t){if(delete c.__onHelpAppHostReady__,(c[r]=t).loaderCdn=d,i)for(var e=t.init.apply(t,i),n=0;n<p.length;n++){var a=p[n];e="t"===a.type?e.then(a.next):e.catch(a.next)}},function(){try{var t=n.getElementsByTagName("script")[0],e=n.createElement("script");e.async=!0,e.src=d+"?q="+(new Date).getTime(),t.parentNode.insertBefore(e,t)}catch(t){}}()}}(window,document,'Gladly',gladlyEnv)

  window.Gladly.init({ appId: gladlyAppId, autoShowWidget: true })
    .then(() => {
      window.havertysChat.isLoaded = true;
      if (window.havertysChat.isRequested) {
        window.havertysChat.openChatPane();
        window.havertysChat.isRequested = false;
      }
    })
    .catch((e) => {
      console.error('Gladly init failed', e);
      window.havertysChat.isRequested = false;
      window.havertysChat.notAvailable();
    });
};

const loadChatBotScript = async () => {
  const chatProvider = await getConfigValue('chat-provider');

  if (chatProvider === 'gladly') {
    await loadGladlyChat();
  } else {
    await loadInsideChat();
  }
};

// Define chat variables and functions
window.havertysChat = {
  isLoaded: false,
  // If user has clicked the link before chat has finished loading
  isRequested: false,

  userDetails: {
    signedInFlag: false,
    firstname: '',
    lastname: '',
    email: '',
  },

  // Define chat bind. This binding is used to make changes to the chat link.
  chatBind: {
    action: 'bind',
    name: 'chatavailable',
    callback() {
      window.havertysChat.isLoaded = true;

      if (window.havertysChat.isRequested) {
        window.havertysChat.openChatPane();
      }

      window.havertysChat.isRequested = false;
    },
  },
  openChatPane() {
    try {
      if (typeof window.Gladly?.show === 'function') {
        window.Gladly.show();
      } else if (window.insideFrontInterface && typeof window.insideFrontInterface.openChatPane === 'function') {
        window.insideFrontInterface.openChatPane();
      } else {
        throw new Error('No available chat provider');
      }
    } catch (error) {
      console.error(error);
      window.havertysChat.notAvailable();
    }
  },
  open() {
    if (window.havertysChat.isLoaded) {
      window.havertysChat.openChatPane();
    } else {
      window.havertysChat.isRequested = true;
    }
    return false;
  },
  notAvailable() {
    // eslint-disable-next-line no-alert
    alert('Chat is not available at this time');
  },
};

loadChatBotScript();

// Define options array for the chat trigger (Inside chat)
window._inside = window._inside || [];
window._inside.push(window.havertysChat.chatBind);

// Open chat on load if requested.
export const openChat = () => window.havertysChat.open();

// Listen for clicks on chat buttons
document.addEventListener('click', (event) => {
  const clickedEl = event.target;
  const HREF = clickedEl.getAttribute('href');

  if (HREF && HREF.indexOf('#openChat') > -1) {
    event.preventDefault();
    window.havertysChat.open();
  }
});

export default { openChat };
