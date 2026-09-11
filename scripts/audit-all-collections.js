const https = require('https');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/data/collections-prebaked.ts');
const content = fs.readFileSync(filePath, 'utf8');

const start = content.indexOf('= [');
const end = content.lastIndexOf('];');
const jsonStr = content.slice(start + 2, end + 1);
const collections = JSON.parse(jsonStr);

function checkHead(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve({ status: 0, error: 'invalid url' });
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 408, error: 'timeout' }); });
    req.end();
  });
}

async function audit() {
  console.log(`Starting comprehensive audit for ${collections.length} collections...`);
  let totalIssues = 0;
  let totalFilms = 0;

  const urlChecks = new Map();

  for (let cIdx = 0; cIdx < collections.length; cIdx++) {
    const col = collections[cIdx];
    console.log(`\n--------------------------------------------------`);
    console.log(`[Collection ${cIdx + 1}/${collections.length}] ${col.title} (${col.films.length} films, totalCount: ${col.totalCount})`);
    
    if (col.films.length !== col.totalCount) {
      console.error(`  [MISMATCH] totalCount (${col.totalCount}) !== films.length (${col.films.length})`);
      totalIssues++;
    }

    if (!col.coverPosters || col.coverPosters.length < 3) {
      console.error(`  [WARN] coverPosters length is < 3 (${col.coverPosters?.length})`);
      totalIssues++;
    }

    // 检查 3 张封面卡
    for (let i = 0; i < (col.coverPosters || []).length; i++) {
      const pUrl = col.coverPosters[i];
      if (!urlChecks.has(pUrl)) {
        urlChecks.set(pUrl, await checkHead(pUrl));
      }
      const res = urlChecks.get(pUrl);
      if (res.status !== 200) {
        console.error(`  [BAD COVER POSTER] deck #${i + 1}: ${pUrl} returned ${res.status}`);
        totalIssues++;
      }
    }

    for (let fIdx = 0; fIdx < col.films.length; fIdx++) {
      totalFilms++;
      const film = col.films[fIdx];
      const prefix = `  (${fIdx + 1}) [${film.title}]`;

      // 1. 检查字段完整性
      if (!film.title || film.title.trim() === '') {
        console.error(`${prefix} Missing title!`);
        totalIssues++;
      }
      if (!film.year || film.year === 'undefined' || parseInt(film.year) < 1920) {
        console.warn(`${prefix} Suspicious year: ${film.year}`);
        totalIssues++;
      }
      if (!film.rate || isNaN(parseFloat(film.rate)) || parseFloat(film.rate) <= 0) {
        console.warn(`${prefix} Suspicious rate: ${film.rate}`);
        totalIssues++;
      }
      if (!film.description || film.description.length < 10) {
        console.warn(`${prefix} Description too short or missing: "${film.description}"`);
        totalIssues++;
      }
      if (!film.actors || film.actors.length === 0) {
        console.warn(`${prefix} Missing actors!`);
        totalIssues++;
      }
      if (!film.types || film.types.length === 0) {
        console.warn(`${prefix} Missing types!`);
        totalIssues++;
      }

      // 2. 检查海报有效性
      if (!film.cover) {
        console.error(`${prefix} Cover URL missing!`);
        totalIssues++;
      } else {
        if (!urlChecks.has(film.cover)) {
          urlChecks.set(film.cover, await checkHead(film.cover));
        }
        const res = urlChecks.get(film.cover);
        if (res.status !== 200) {
          console.error(`${prefix} BAD COVER: ${film.cover} returned ${res.status} (${res.error})`);
          totalIssues++;
        }
      }
    }
  }

  console.log(`\n==================================================`);
  console.log(`AUDIT FINISHED:`);
  console.log(`Total Collections Checked: ${collections.length}`);
  console.log(`Total Films Audited: ${totalFilms}`);
  console.log(`Unique Image URLs Checked: ${urlChecks.size}`);
  console.log(`Total Issues Found: ${totalIssues}`);
  console.log(`==================================================`);
}

audit();
