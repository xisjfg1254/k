const token = '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';
const owner = 'xisjfg1254';
const repo = 'k';
const blogsPath = 'data/blogs.json';
const projectsPath = 'data/projects.json';
const activitiesPath = 'data/activities.json';

// تسجيل الدخول البسيط
function loginAdmin(){
  const user = document.getElementById('adminUser').value;
  const pass = document.getElementById('adminPass').value;
  if(user==='admin' && pass==='1234567'){
    alert("✅ تم تسجيل الدخول");
    document.getElementById('adminPanel').style.display='block';
  } else alert("❌ اسم المستخدم أو كلمة المرور خاطئ");
}

// رفع مشروع
async function uploadProject(){
  const title = document.getElementById('projectTitle').value;
  const desc = document.getElementById('projectDesc').value;
  const amount = document.getElementById('projectAmount').value;
  const file = document.getElementById('projectFile').files[0];
  if(!title||!desc||!file){ alert("املأ كل الحقول واختر ملف"); return; }

  const reader = new FileReader();
  reader.onprogress = (e) => {
    if(e.lengthComputable){
      const percent = Math.round((e.loaded/e.total)*100);
      document.getElementById('projectProgress').style.width = percent+'%';
      document.getElementById('projectProgress').textContent = percent+'%';
    }
  };
  reader.onload = async () => {
    const content = reader.result.split(',')[1];
    const data = await fetchGitHubJSON(projectsPath);
    data.push({title, desc, amount, fileName:file.name, fileContent:content});
    await saveGitHubJSON(projectsPath, data);
    alert("✅ تم إضافة المشروع");
    document.getElementById('projectTitle').value='';
    document.getElementById('projectDesc').value='';
    document.getElementById('projectAmount').value='';
    document.getElementById('projectFile').value='';
    document.getElementById('projectProgress').style.width='0%';
    document.getElementById('projectProgress').textContent='0%';
    loadProjects();
  };
  reader.readAsDataURL(file);
}

// رفع النشاط
async function uploadActivity(){
  const title = document.getElementById('activityTitle').value;
  const desc = document.getElementById('activityDesc').value;
  const file = document.getElementById('activityFile').files[0];
  if(!title||!desc||!file){ alert("املأ كل الحقول واختر ملف"); return; }

  const reader = new FileReader();
  reader.onprogress = (e) => {
    if(e.lengthComputable){
      const percent = Math.round((e.loaded/e.total)*100);
      document.getElementById('activityProgress').style.width = percent+'%';
      document.getElementById('activityProgress').textContent = percent+'%';
    }
  };
  reader.onload = async () => {
    const content = reader.result.split(',')[1];
    const data = await fetchGitHubJSON(activitiesPath);
    data.push({title, desc, fileName:file.name, fileContent:content});
    await saveGitHubJSON(activitiesPath, data);
    alert("✅ تم إضافة النشاط");
    document.getElementById('activityTitle').value='';
    document.getElementById('activityDesc').value='';
    document.getElementById('activityFile').value='';
    document.getElementById('activityProgress').style.width='0%';
    document.getElementById('activityProgress').textContent='0%';
    loadActivities();
  };
  reader.readAsDataURL(file);
}

// إضافة مدونة
async function addBlog(){
  const title = document.getElementById('blogTitle').value;
  const desc = document.getElementById('blogDesc').value;
  if(!title||!desc){ alert("املأ كل الحقول"); return; }
  const data = await fetchGitHubJSON(blogsPath);
  data.push({title, desc});
  await saveGitHubJSON(blogsPath, data);
  alert("✅ تم إضافة المدونة");
  document.getElementById('blogTitle').value='';
  document.getElementById('blogDesc').value='';
  loadBlogs();
}

// تحميل وعرض البيانات
async function fetchGitHubJSON(path){
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers:{Authorization:`token ${token}`}
  });
  const json = await res.json();
  return JSON.parse(atob(json.content));
}

async function saveGitHubJSON(path, data){
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method:'PUT',
    headers:{
      Authorization:`token ${token}`,
      'Content-Type':'application/json'
    },
    body: JSON.stringify({
      message:'update '+path,
      content:btoa(JSON.stringify(data)),
      sha: await getFileSha(path)
    })
  });
  return res.json();
}

async function getFileSha(path){
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    headers:{Authorization:`token ${token}`}
  });
  const json = await res.json();
  return json.sha;
}

// تحميل البيانات للعرض
async function loadProjects(){
  const list = document.getElementById('projectsList');
  if(!list) return;
  list.innerHTML='';
  const data = await fetchGitHubJSON(projectsPath);
  data.forEach(p=>{
    const card = document.createElement('div');
    card.className='card';
    let media='';
    if(p.fileName.endsWith('.mp4')) media=`<video controls src="data:video/mp4;base64,${p.fileContent}"></video>`;
    else media=`<img src="data:image;base64,${p.fileContent}">`;
    card.innerHTML=`${media}<h3>${p.title}</h3><p>${p.desc}</p><p>المبلغ: ${p.amount||'-'}</p>`;
    list.appendChild(card);
  });
}

async function loadActivities(){
  const list = document.getElementById('activitiesList');
  if(!list) return;
  list.innerHTML='';
  const data = await fetchGitHubJSON(activitiesPath);
  data.forEach(a=>{
    const card = document.createElement('div');
    card.className='card';
    let media='';
    if(a.fileName.endsWith('.mp4')) media=`<video controls src="data:video/mp4;base64,${a.fileContent}"></video>`;
    else media=`<img src="data:image;base64,${a.fileContent}">`;
    card.innerHTML=`${media}<h3>${a.title}</h3><p>${a.desc}</p>`;
    list.appendChild(card);
  });
}

async function loadBlogs(){
  const list = document.getElementById('blogsList');
  if(!list) return;
  list.innerHTML='';
  const data = await fetchGitHubJSON(blogsPath);
  data.forEach(b=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML=`<h3>${b.title}</h3><p>${b.desc}</p>`;
    list.appendChild(card);
  });
}

// تحميل عند البداية
loadProjects();
loadActivities();
loadBlogs();
