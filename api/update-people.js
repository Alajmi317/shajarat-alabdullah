// api/update-people.js
// دالة Vercel Serverless لتحديث people.json في GitHub

const OWNER = 'Alajmi317';
const REPO  = 'shajarat-alabdullah';
const BRANCH = 'main';          // إذا فرعك اسمه غير main غيّره هنا
const FILE_PATH = 'people.json';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'GITHUB_TOKEN is not set' }));
    }

    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    const parsed = JSON.parse(body || '{}');
    const content = parsed.content;

    if (!content) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Missing content' }));
    }

    const jsonString = typeof content === 'string'
      ? content
      : JSON.stringify(content, null, 2);

    // نجيب sha الحالي للملف (لو موجود)
    const getResp = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json'
        }
      }
    );

    let sha = undefined;
    if (getResp.ok) {
      const fileData = await getResp.json();
      sha = fileData.sha;
    }

    const putResp = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json'
        },
        body: JSON.stringify({
          message: 'Update people.json from admin panel',
          content: Buffer.from(jsonString, 'utf8').toString('base64'),
          branch: BRANCH,
          sha
        })
      }
    );

    const result = await putResp.json();

    if (!putResp.ok) {
      console.error(result);
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'GitHub update failed', detail: result }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, commit: result.commit && result.commit.sha }));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Server error', detail: String(err) }));
  }
};
