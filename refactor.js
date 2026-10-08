const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove global constants
content = content.replace(/const apk = '.*?';\n/, '');
content = content.replace(/const repo = '.*?';\n/, '');
content = content.replace(/const waNumber = '.*?';\n/, '');
content = content.replace(/const waHelpUrl = `.*?`;\n/, '');
content = content.replace(/const waOwnerUrl = `.*?`;\n/, '');

// 2. Add state and useEffect inside Home
const homeHookInsertion = `
  const [appConfig, setAppConfig] = useState({
    apk: 'https://github.com/g-423/KosKita/releases/download/v1.0.0-beta/CariKostKita-v1.0.0-beta.apk',
    waNumber: '6281270008899'
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL;
        if (!url) return;
        
        // Fetch Settings
        const setRes = await fetch(url + '/settings');
        const setJson = await setRes.json();
        
        // Fetch App Release
        const relRes = await fetch(url + '/app-latest');
        const relJson = await relRes.json();
        
        let newApk = appConfig.apk;
        let newWa = appConfig.waNumber;
        
        if (relJson.success && relJson.data?.apk_url) {
           newApk = relJson.data.apk_url;
        }
        if (setJson.success && setJson.data?.contact_whatsapp) {
           newWa = setJson.data.contact_whatsapp;
        }
        
        setAppConfig({ apk: newApk, waNumber: newWa });
      } catch (e) {
        console.error('Failed to fetch dynamic settings', e);
      }
    }
    fetchConfig();
  }, []);

  const apk = appConfig.apk;
  const waNumber = appConfig.waNumber;
  const repo = 'https://github.com/g-423/KosKita';
  const waHelpUrl = \`https://wa.me/\${waNumber}?text=\${encodeURIComponent('Halo Admin CariKostKita, saya butuh informasi seputar aplikasi kost Pekanbaru.')}\`;
  const waOwnerUrl = \`https://wa.me/\${waNumber}?text=\${encodeURIComponent('Halo Admin CariKostKita, saya pemilik kost di Pekanbaru ingin mendaftarkan properti saya.')}\`;
`;

content = content.replace('export default function Home() {', 'export default function Home() {' + homeHookInsertion);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored app/page.tsx');
