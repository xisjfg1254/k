// إعداد GitHub
const token = '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';
const owner = 'xisjfg1254';
const repo = 'k';
const path = 'data.json';

// التبديل بين الأقسام
function showSection(id){
  document.querySelectorAll('.view').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// جلب بيانات JSON من GitHub
async function getDataJson(){
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
  const data = await res.json();
  return { content: JSON.parse(atob(data.content)), sha: data.sha };
}

// تحديث بيانات JSON على GitHub
async function updateDataJson(newData, sha){
  await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message:'Update data', content:btoa(JSON.stringify(newData,null,2)), sha })
  });
}

// إضافة مشروع
async function addProject(){
  const { content, sha } = await getDataJson();
  const title=document.getElementById('title').value;
  const desc=document.getElementById('desc').value;
  const amount=document.getElementById('amount').value;
  const fileInput=document.getElementById('fileInput');
  if(!title||!desc||!fileInput.files[0]) { alert('املأ جميع الحقول واختر ملف'); return; }

  const reader = new FileReader();
  reader.onload=async ()=>{
    const base64=reader.result.split(',')[1];
    const fileName=fileInput.files[0].name;
    // رفع الملف إلى GitHub
    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/assets/${fileName}`, {
      method:'PUT',
      headers:{'Authorization':`token ${token}`, 'Content-Type':'application/json'},
      body: JSON.stringify({ message:'Upload file', content:base64 })
    });
    const fileUrl=`https://raw.githubusercontent.com/${owner}/${repo}/main/assets/${fileName}`;
    content.projects.push({ title, desc, amount, fileUrl, createdAt:new Date().toISOString() });
    await updateDataJson(content, sha);
    alert('تم إضافة المشروع بنجاح ✅');
    loadProjects();
  };
  reader.readAsDataURL(fileInput.files[0]);
}

// تحميل المشاريع إلى الموقع
async function loadProjects(){
  const { content } = await getDataJson();
  const list = document.getElementById('projectsList');
  if(!list) return;
  list.innerHTML='';
  content.projects.forEach(p=>{
    const div = document.createElement('div');
    div.className='card';
    div.innerHTML=`<img src="${p.fileUrl}" alt="${p.title}"><h3>${p.title}</h3><p>${p.desc}</p><p>المبلغ: ${p.amount || '-'}</p>`;
    list.appendChild(div);
  });
}
loadProjects();

// نفس الفكرة للنشاطات والمدونات
async function addActivity(){ /* ... */ }
async function loadActivities(){ /* ... */ }
async function addBlog(){ /* ... */ }
async function loadBlogs(){ /* ... */ }

// تسجيل الدخول (مثال بسيط)
function loginAdmin(){
  const email=document.getElementById('adminEmail').value;
  const pass=document.getElementById('adminPass').value;
  if(email==='admin@example.com' && pass==='1234567'){
    document.getElementById('adminPanel').style.display='block';
    alert('تم تسجيل الدخول ✅');
  }else alert('❌ البريد أو كلمة المرور غير صحيحة');
}
