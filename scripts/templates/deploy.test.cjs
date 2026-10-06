// Offline integration tests: fake CLIs only. No network, cloning, or deployments.
/* eslint-disable @typescript-eslint/no-require-imports -- This Node CommonJS harness loads compiled CommonJS tooling. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function fixture(options = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'grids-template-test-')));
  const build = path.join(root, 'scripts/templates/.build');
  fs.mkdirSync(build, { recursive: true });
  for (const file of ['deploy.js', 'shared.js', 'discover.js', 'manifest.js', 'plan.js', 'workspace.js', 'deploy-all.js', 'domain.js', 'dns-check.js', 'configure-domain.js', 'read-retry.js', 'godaddy.js', 'setup-state.js', 'state.js']) fs.copyFileSync(path.join(__dirname, '.build', file), path.join(build, file));
  const bin = path.join(root, 'bin');
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, 'options.json'), JSON.stringify(options));
  const mock = `#!${process.execPath}
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const bin=path.dirname(process.argv[1]);
const root=path.dirname(bin);
const opt=JSON.parse(fs.readFileSync(path.join(bin,'options.json'),'utf8'));
const cmd=path.basename(process.argv[1]), args=process.argv.slice(2);
fs.appendFileSync(path.join(root,'calls.jsonl'),JSON.stringify({cmd,args,cwd:process.cwd()})+'\\n');
function fail(message){console.error(message);process.exit(1)}
if(cmd==='gh'){
  assert.equal(process.env.GITHUB_TOKEN,undefined); assert.equal(process.env.GH_TOKEN,undefined);
  if(args[0]==='--version') process.exit(0);
  if(args[0]==='auth') { if(opt.authFail)fail('not authenticated');process.exit(0); }
  if(args[0]==='api'){
    assert(args.includes('--paginate')&&args.includes('--slurp'));
    function repo(id,name,owner='Lexington-Themes',priv=true){return {id,name,owner:{login:owner},private:priv,full_name:owner+'/'+name,default_branch:'main',clone_url:'https://example.invalid/clone',html_url:'https://example.invalid/repo'}}
    console.log(JSON.stringify([[repo(9,'zeta'),repo(10,'aa-new'),repo(2,'aelen-emdash'),repo(5,'public','Lexington-Themes',false)],[repo(3,'aelen','lexington-themes'),repo(4,'lexington-motion'),repo(6,'aelen-sanity-astro'),repo(7,'other','Other')]]));process.exit(0);
  }
  assert.deepEqual(args.slice(0,3),['repo','clone','Lexington-Themes/alfred']);
  const dir=args[3]; assert.equal(path.dirname(dir),path.join(root,'.tmp/templates')); assert.match(path.basename(dir),/^002-[A-Za-z0-9]+$/);
  if(opt.cloneFail)fail('clone failed');
  const manager=opt.manager||'npm', version=manager==='yarn'?(opt.yarnModern?'4.1.0':'1.22.22'):manager==='pnpm'?'9.0.0':manager==='bun'?'1.1.0':'10.0.0';
  fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({packageManager:manager+'@'+version,scripts:opt.noBuild?{}:{build:'astro build'},dependencies:{astro:'5.0.0'},engines:{node:'>=20'}}));
  if(!opt.noLock)fs.writeFileSync(path.join(dir,manager==='npm'?'package-lock.json':manager==='pnpm'?'pnpm-lock.yaml':manager==='yarn'?'yarn.lock':'bun.lock'),'fixture');
  if(opt.conflictLock)fs.writeFileSync(path.join(dir,'pnpm-lock.yaml'),'fixture');
  if(opt.envFile)fs.writeFileSync(path.join(dir,'.env'),'SECRET=do-not-print');
  if(opt.oldLink)fs.mkdirSync(path.join(dir,'.vercel'));
  if(opt.configAlias)fs.writeFileSync(path.join(dir,'vercel.json'),JSON.stringify({alias:'gridsagency.com'}));
  if(opt.symlink)fs.symlinkSync(path.join(root,'outside'),path.join(dir,'external'));
  process.exit(0);
}
for(const key of ['GITHUB_TOKEN','GH_TOKEN','VERCEL_TOKEN','NEXT_PUBLIC_SECRET','DATABASE_URL'])assert.equal(process.env[key],undefined,key);
if(cmd!=='vercel'){
  assert.equal(process.env.VERCEL_PROJECT_ID,undefined);
  assert(process.env.HOME.includes('.grids-tooling/home'));
  if(args[0]==='--version'){console.log(cmd==='yarn'?(opt.yarnModern?'4.1.0':'1.22.22'):cmd==='pnpm'?'9.0.0':cmd==='bun'?'1.1.0':'10.0.0');process.exit(0)}
  if(args[0]==='run'){
    assert.deepEqual(args,['run','build']);
    if(opt.buildFail)fail('Astro build error: fixture failure; token=hidden-build-token');
  }else if(opt.installFail)fail('install fixture failure');
  process.exit(0);
}
assert(process.cwd().startsWith(path.join(root,'.tmp/templates/002-')));
if(args[0]==='--version')process.exit(0);
if(args[0]==='whoami'){if(opt.vercelAuthFail)fail('not logged in');console.log('fixture-user');process.exit(0)}
if(args[0]==='api'){
  if(args[1]!=='/v10/projects'){
    assert(opt.domainFlow, 'normal deployment must not configure domains');
    assert(args[1].includes('teamId=team_demo'));
    if(args[1].startsWith('/v9/projects/prj_demo?')){
      console.log(JSON.stringify({id:'prj_demo',name:opt.domainWrongProject?'GRIDS':'grids-demo-002',accountId:'team_demo'}));process.exit(0);
    }
    if(args[1].startsWith('/v6/domains/demo-002.gridsagency.com/config?')){
      console.log(JSON.stringify({recommendedCNAME:[{rank:1,value:'exact-002.vercel-dns-099.com.'}],misconfigured:false}));process.exit(0);
    }
    assert(args[1].startsWith('/v10/projects/prj_demo/domains?')||args[1].startsWith('/v9/projects/prj_demo/domains/demo-002.gridsagency.com?'));
    if(args[3]==='POST')assert.deepEqual(JSON.parse(fs.readFileSync(args[args.indexOf('--input')+1],'utf8')),{name:'demo-002.gridsagency.com'});
    console.log(JSON.stringify({name:'demo-002.gridsagency.com',projectId:'prj_demo',verified:true}));process.exit(0);
  }
  assert.deepEqual(args.slice(0,4),['api','/v10/projects','-X','POST']);
  const request=JSON.parse(fs.readFileSync(args[args.indexOf('--input')+1],'utf8'));
  assert.equal(request.name,'grids-demo-002');assert.equal(request.framework,'astro');
  if(opt.projectExists)fail('Project already exists (409)');
  console.log(JSON.stringify({name:'grids-demo-002',id:'prj_demo',accountId:'team_demo'}));process.exit(0);
}
if(args[0]==='link'){
  assert(args.includes('--yes'));assert.equal(args[args.indexOf('--project')+1],'grids-demo-002');
  fs.mkdirSync('.vercel');fs.writeFileSync('.vercel/project.json',JSON.stringify({projectId:opt.wrongLink?'prj_GRIDS_PRODUCTION':'prj_demo',orgId:'team_demo',projectName:'grids-demo-002'}));process.exit(0);
}
assert.equal(args[0],'deploy');assert(args.includes('--prod')&&args.includes('--yes'));
assert.equal(process.env.VERCEL_PROJECT_ID,'prj_demo');assert.equal(process.env.VERCEL_ORG_ID,'team_demo');
assert(fs.readFileSync('.vercelignore','utf8').includes('**/.env*'));
if(opt.deployFail)fail('deployment fixture failure');
console.log('https://grids-demo-002-fixture.vercel.app');
`;
  for (const command of ['gh', 'npm', 'pnpm', 'yarn', 'bun', 'vercel']) {
    fs.writeFileSync(path.join(bin, command), mock, { mode: 0o755 });
  }
  fs.mkdirSync(path.join(root, 'outside'));
  fs.writeFileSync(path.join(root, 'outside/sentinel'), 'keep');
  const env = { ...process.env, PATH: bin, GITHUB_TOKEN: 'unused-gh-token', GH_TOKEN: 'unused-gh-token', VERCEL_TOKEN: 'unused-vercel-token', VERCEL_PROJECT_ID: 'prj_GRIDS_PRODUCTION', VERCEL_ORG_ID: 'team_PRODUCTION', NEXT_PUBLIC_SECRET: 'never-forward', DATABASE_URL: 'never-forward' };
  if (options.domainFlow) {
    fs.writeFileSync(path.join(root, '.env.local'), 'GODADDY_PAT=offline-domain-fixture-only\n');
    fs.writeFileSync(path.join(root, 'fetch-mock.cjs'), `
const fs = require('node:fs'), assert = require('node:assert/strict');
let entries = ${options.domainConflict ? "[{type:'A',name:'demo-002',data:'192.0.2.1',ttl:600}]" : '[]'};
globalThis.fetch = async (input, options) => {
  const url = new URL(String(input));
  assert.equal(url.origin, 'https://api.godaddy.com');
  assert.equal(url.pathname, '/v3/domains/zones/gridsagency.com/dns-records');
  assert.equal(options.headers.Authorization, 'Bearer offline-domain-fixture-only');
  fs.appendFileSync(${JSON.stringify(path.join(root, 'calls.jsonl'))}, JSON.stringify({cmd:'godaddy',args:[options.method,url.searchParams.get('name')],cwd:process.cwd()})+'\\n');
  if(options.method==='GET'){
    assert.equal(url.searchParams.get('name'),'demo-002');
    return Response.json({items:entries,totalItems:entries.length,totalPages:1});
  }
  assert.equal(options.method,'POST');
  const record=JSON.parse(options.body);
  assert.deepEqual(record,{type:'CNAME',name:'demo-002',data:'exact-002.vercel-dns-099.com.',ttl:600});
  entries=[record];return Response.json(record,{status:201});
};
`);
  }
  function execute(file = 'deploy.js', args = ['--id=002']) {
    const preload = options.domainFlow ? ['--require', path.join(root, 'fetch-mock.cjs')] : [];
    const result = spawnSync(process.execPath, [...preload, path.join(build, file), ...args], { env, cwd: root, encoding: 'utf8' });
    const calls = fs.existsSync(path.join(root, 'calls.jsonl')) ? fs.readFileSync(path.join(root, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse) : [];
    return { ...result, output: result.stdout + result.stderr, calls };
  }
  return { root, execute, clean: () => fs.rmSync(root, { recursive: true, force: true }) };
}
function check(options, fn) {
  const f = fixture(options);
  try {
    const result = f.execute();
    fn(result, f);
    const temp = path.join(f.root, '.tmp/templates');
    if (fs.existsSync(temp)) assert.deepEqual(fs.readdirSync(temp), [], 'every run must clean its unique directory');
    assert.equal(fs.readFileSync(path.join(f.root, 'outside/sentinel'), 'utf8'), 'keep');
  } finally { f.clean(); }
}

test('discovery reconciles permanent IDs, missing themes, and new candidates', () => check({}, (_, f) => {
  const r = f.execute('discover.js', []);
  assert.equal(r.status, 0, r.output);
  assert.match(r.output, /001\s+aelen\s+Lexington-Themes\/aelen\s+PRESENT/);
  assert.match(r.output, /002\s+alfred\s+Lexington-Themes\/alfred\s+MISSING/);
  assert.match(r.output, /---\s+aa-new/);
  assert.match(r.output, /Manifest themes present on GitHub: 1/);
  assert.match(r.output, /Manifest themes missing \/ not accessible: 50/);
  assert.match(r.output, /New candidate themes not in manifest: 2/);
  assert.match(r.output, /All Lexington private repos: 6/);
  assert.match(r.output, /Excluded variant repos: 2/);
  assert.match(r.output, /Excluded known non-theme repos: 1/);
  assert.match(r.output, /Candidate base themes: 3/);
}));

for (const args of [[], ['--id=000'], ['--id=../001'], ['--id=001', '--id=002'], ['--all']]) {
  test('reject unsafe/missing ID: ' + JSON.stringify(args), () => {
    const f = fixture();
    try { const r = f.execute('deploy.js', args); assert.equal(r.status, 1); assert.equal(r.calls.length, 0); } finally { f.clean(); }
  });
}
test('unknown ID never clones or calls Vercel', () => {
  const f = fixture();
  try { const r = f.execute('deploy.js', ['--id=999']); assert.equal(r.status, 1); assert(!r.calls.some(c => c.args[0] === 'repo' || c.cmd === 'vercel')); } finally { f.clean(); }
});

for (const options of [{}, { manager: 'pnpm' }, { manager: 'yarn' }, { manager: 'yarn', yarnModern: true }, { manager: 'bun' }]) {
  test('single deployment flow with ' + JSON.stringify(options), () => check(options, r => {
    assert.equal(r.status, 0, r.output);
    const manager = options.manager || 'npm';
    const install = r.calls.find(c => c.cmd === manager && ['ci', 'install'].includes(c.args[0]));
    assert.deepEqual(install.args, manager === 'npm' ? ['ci'] : manager === 'yarn' && options.yarnModern ? ['install', '--immutable'] : ['install', '--frozen-lockfile']);
    const buildIndex = r.calls.findIndex(c => c.args[0] === 'run');
    assert(r.calls.findIndex(c => c.cmd === 'vercel') > buildIndex);
    assert.equal(r.calls.filter(c => c.args[0] === 'repo').length, 1);
    assert.equal(r.calls.filter(c => c.cmd === 'vercel' && c.args[0] === 'deploy').length, 1);
    for (const stage of ['Clone', 'Install', 'Build', 'Deploy']) assert.match(r.output, new RegExp(stage + ':\\s+SUCCESS'));
    assert.match(r.output, /Live URL:\nhttps:\/\/grids-demo-002-fixture.vercel.app/);
  }));
}
for (const options of [{ authFail: true }, { cloneFail: true }, { installFail: true }, { buildFail: true }, { noBuild: true }, { noLock: true }, { conflictLock: true }, { envFile: true }, { oldLink: true }, { configAlias: true }, { symlink: true }]) {
  test('failure prevents all Vercel calls: ' + JSON.stringify(options), () => check(options, r => {
    assert.equal(r.status, 1, r.output);
    assert(!r.calls.some(c => c.cmd === 'vercel'), r.output);
    assert(!r.output.includes('do-not-print') && !r.output.includes('hidden-build-token'));
    if (options.buildFail) {
      assert.match(r.output, /Astro build error: fixture failure/);
      assert.match(r.output, /Install:\s+SUCCESS/);
      assert.match(r.output, /Build:\s+FAILED/);
    } else if (options.cloneFail) assert.match(r.output, /Clone:\s+FAILED/);
    else if (!options.authFail) assert.match(r.output, /Install:\s+FAILED/);
  }));
}
for (const options of [{ vercelAuthFail: true }, { projectExists: true }, { wrongLink: true }]) {
  test('Vercel safeguard stops deployment: ' + JSON.stringify(options), () => check(options, r => {
    assert.equal(r.status, 1, r.output);
    assert.match(r.output, /Build:\s+SUCCESS/);
    assert.match(r.output, /Deploy:\s+FAILED/);
    assert(!r.calls.some(c => c.cmd === 'vercel' && c.args[0] === 'deploy'));
  }));
}
test('stale legacy clone cannot block a retry and is never deleted', () => {
  const f = fixture();
  try {
    const legacy = path.join(f.root, '.tmp/templates/002');
    fs.mkdirSync(legacy, { recursive: true });
    fs.writeFileSync(path.join(legacy, 'sentinel'), 'keep');
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = f.execute(); assert.equal(r.status, 0, r.output);
      assert.deepEqual(fs.readdirSync(path.dirname(legacy)), ['002']);
      assert.equal(fs.readFileSync(path.join(legacy, 'sentinel'), 'utf8'), 'keep');
    }
  } finally { f.clean(); }
});
test('Vercel failure prints failed stage without claiming success', () => check({ deployFail: true }, r => {
  assert.equal(r.status, 1); assert.match(r.output, /Deploy:\s+FAILED/); assert(!r.output.includes('Live URL:'));
}));
test('symlinked temporary workspace is rejected', () => {
  const f = fixture();
  try {
    fs.symlinkSync(path.join(f.root, 'bin'), path.join(f.root, '.tmp'));
    const r = f.execute(); assert.equal(r.status, 1);
    assert.match(r.output, /Temporary workspace must be an ordinary directory/);
    assert(!r.calls.some(c => c.args[0] === 'repo' || c.cmd === 'vercel'));
  } finally { f.clean(); }
});
test('missing gh reports login instructions before any clone', () => {
  const f = fixture();
  try {
    fs.unlinkSync(path.join(f.root, 'bin/gh'));
    const r = f.execute(); assert.equal(r.status, 1); assert.equal(r.calls.length, 0);
    assert.match(r.output, /Install gh, then run: gh auth login/);
  } finally { f.clean(); }
});

test('permanent manifest freezes all 51 mappings and intended domains', () => {
  const { loadManifest, resolveTemplate } = require('./.build/manifest.js');
  const themes = loadManifest();
  assert.equal(themes.length, 51);
  assert.equal(resolveTemplate('001').theme, 'aelen');
  assert.equal(resolveTemplate('002').theme, 'alfred');
  assert.equal(resolveTemplate('051').theme, 'zeroindex');
  for (let index = 0; index < themes.length; index++) {
    const theme = themes[index];
    assert.equal(theme.id, String(index + 1).padStart(3, '0'));
    assert.equal(theme.repository, 'Lexington-Themes/' + theme.theme);
    assert.equal(theme.vercelProjectName, 'grids-demo-' + theme.id);
    assert.equal(theme.customDomain, 'demo-' + theme.id + '.gridsagency.com');
  }
});
for (const id of ['001', '002', '051']) {
  test('single dry-run is offline and side-effect free: ' + id, () => {
    const f = fixture();
    try {
      const before = fs.readdirSync(f.root);
      const r = f.execute('deploy.js', ['--id=' + id, '--dry-run']);
      assert.equal(r.status, 0, r.output); assert.equal(r.calls.length, 0);
      assert.deepEqual(fs.readdirSync(f.root), before);
      assert.match(r.output, new RegExp('Vercel project: grids-demo-' + id));
      assert.match(r.output, new RegExp('demo-' + id + '\\.gridsagency.com \\(metadata only\\)'));
    } finally { f.clean(); }
  });
}
test('existing 001 is protected even for a live invocation', () => {
  const f = fixture();
  try {
    const before = fs.readdirSync(f.root);
    const r = f.execute('deploy.js', ['--id=001']);
    assert.equal(r.status, 0, r.output); assert.equal(r.calls.length, 0);
    assert.deepEqual(fs.readdirSync(f.root), before);
    assert.match(r.output, /already live/); assert.match(r.output, /SKIPPED/);
  } finally { f.clean(); }
});
for (const args of [[], ['--id=002'], ['--dry-run', '--live'], ['--dry-run', '--dry-run']]) {
  test('bulk rejects all live/ambiguous requests: ' + JSON.stringify(args), () => {
    const f = fixture();
    try {
      const r = f.execute('deploy-all.js', args); assert.equal(r.status, 1); assert.equal(r.calls.length, 0);
      assert.match(r.output, /Bulk live deployment has not been enabled yet/);
      assert(!fs.existsSync(path.join(f.root, '.tmp')));
    } finally { f.clean(); }
  });
}
test('bulk dry-run prints all 51 mappings in order without external commands or temp directories', () => {
  const f = fixture();
  try {
    const before = fs.readdirSync(f.root);
    const r = f.execute('deploy-all.js', ['--dry-run']); assert.equal(r.status, 0, r.output);
    assert.equal(r.calls.length, 0); assert.deepEqual(fs.readdirSync(f.root), before);
    const rows = r.stdout.split('\n').filter(line => /^\d{3}\s/.test(line));
    assert.equal(rows.length, 51);
    assert.match(rows[0], /^001\s+aelen\s+Lexington-Themes\/aelen\s+grids-demo-001\s+demo-001.gridsagency.com$/);
    assert.match(rows[1], /^002\s+alfred/); assert.match(rows[50], /^051\s+zeroindex/);
    assert.match(r.stdout, /Existing deployments protected: 1/);
  } finally { f.clean(); }
});

test('workspace cleanup removes child symlinks without touching their targets', () => {
  const { createWorkspace } = require('./.build/workspace.js');
  const f = fixture();
  try {
    const work = createWorkspace(f.root, '002');
    fs.symlinkSync(path.join(f.root, 'outside'), path.join(work.directory, 'external'));
    work.cleanup(); work.cleanup();
    assert(!fs.existsSync(work.directory));
    assert.equal(fs.readFileSync(path.join(f.root, 'outside/sentinel'), 'utf8'), 'keep');
  } finally { f.clean(); }
});
test('workspace cleanup refuses a replaced run directory', () => {
  const { createWorkspace } = require('./.build/workspace.js');
  const f = fixture();
  try {
    const work = createWorkspace(f.root, '002');
    fs.renameSync(work.directory, work.directory + '-original');
    fs.symlinkSync(path.join(f.root, 'outside'), work.directory);
    assert.throws(() => work.cleanup(), /Cleanup refused a replaced/);
    assert.equal(fs.readFileSync(path.join(f.root, 'outside/sentinel'), 'utf8'), 'keep');
  } finally { f.clean(); }
});

test('domain dry-run has no external calls or filesystem changes', () => {
  const f = fixture();
  try {
    const before = fs.readdirSync(f.root);
    const r = f.execute('deploy.js', ['--id=002', '--configure-domain', '--dry-run']);
    assert.equal(r.status, 0, r.output); assert.equal(r.calls.length, 0);
    assert.deepEqual(fs.readdirSync(f.root), before);
    for (const text of ['Lexington-Themes/alfred', 'grids-demo-002', 'demo-002.gridsagency.com', 'GoDaddy hostname that WOULD be modified: demo-002']) assert(r.output.includes(text));
  } finally { f.clean(); }
});
test('domain mode refuses other IDs before external calls', () => {
  const f = fixture();
  try {
    for (const id of ['001', '003']) {
      const r = f.execute('deploy.js', ['--id=' + id, '--configure-domain']);
      assert.equal(r.status, 1); assert.equal(r.calls.length, 0);
    }
  } finally { f.clean(); }
});

test('full opt-in workflow configures only 002 after successful deployment and cleans up', () => {
  const f = fixture({ domainFlow: true });
  try {
    const r = f.execute('deploy.js', ['--id=002', '--configure-domain']);
    assert.equal(r.status, 0, r.output);
    const deploy = r.calls.findIndex(c => c.cmd === 'vercel' && c.args[0] === 'deploy');
    const assignment = r.calls.findIndex(c => c.cmd === 'vercel' && c.args[1]?.startsWith('/v10/projects/prj_demo/domains?'));
    const dns = r.calls.findIndex(c => c.cmd === 'godaddy');
    assert(deploy >= 0 && assignment > deploy && dns > assignment);
    assert.equal(r.calls.filter(c => c.cmd === 'godaddy' && c.args[0] === 'POST').length, 1);
    for (const stage of ['Vercel deployment', 'Domain assignment', 'GoDaddy DNS', 'Domain verification']) assert.match(r.output, new RegExp(stage + ':\\s+SUCCESS'));
    assert.match(r.output, /Production URL:\nhttps:\/\/demo-002.gridsagency.com/);
    assert.deepEqual(fs.readdirSync(path.join(f.root, '.tmp/templates')), []);
    assert(!r.output.includes('offline-domain-fixture-only'));
  } finally { f.clean(); }
});
for (const options of [{domainFlow:true,domainConflict:true},{domainFlow:true,domainWrongProject:true}]) {
  test('domain guard failure retains successful deployment and cleans up: '+JSON.stringify(options), () => {
    const f=fixture(options);
    try {
      const r=f.execute('deploy.js',['--id=002','--configure-domain']);
      assert.equal(r.status,1,r.output);assert.match(r.output,/Vercel deployment:\s+SUCCESS/);
      assert(!r.calls.some(c=>c.cmd==='godaddy'&&c.args[0]==='POST'));
      assert.deepEqual(fs.readdirSync(path.join(f.root,'.tmp/templates')),[]);
    }finally{f.clean();}
  });
}
test('normal deployment remains opt-out even when PAT is available', () => {
  const f=fixture({domainFlow:true});
  try {
    const r=f.execute();assert.equal(r.status,0,r.output);
    assert(!r.calls.some(c=>c.cmd==='godaddy'));
    assert(!r.calls.some(c=>c.cmd==='vercel'&&c.args[1]?.includes('/domains')));
  } finally { f.clean(); }
});
