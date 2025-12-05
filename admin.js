// admin.js
let members = [];

async function init() {
  try {
    const res = await fetch('members.json');
    members = await res.json();
  } catch (e) {
    members = [];
  }
  renderList();
}

function renderList() {
  const list = document.getElementById('list');
  list.innerHTML = '';
  if (!members.length) list.innerHTML = '<p>لا يوجد أفراد حالياً.</p>';
  members.forEach(m => {
    const div = document.createElement('div');
    div.className = 'admin-item';
    div.innerHTML = `
      <img src="${m.photo}" alt="${m.name}" style="width:60px;height:60px;object-fit:cover;border-radius:6px"/>
      <strong>${m.name}</strong> <small>${m.city || ''}</small>
      <div class="admin-actions">
        <button data-id="${m.id}" class="edit">تعديل</button>
        <button data-id="${m.id}" class="delete">حذف</button>
      </div>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll('.edit').forEach(btn => btn.onclick = e => startEdit(e.target.dataset.id));
  document.querySelectorAll('.delete').forEach(btn => btn.onclick = e => { if(confirm('حذف؟')) deleteMember(e.target.dataset.id); });
}

function startEdit(id) {
  const m = members.find(x=>x.id===id);
  if (!m) return;
  document.getElementById('id').value = m.id;
  document.getElementById('name').value = m.name;
  document.getElementById('birth').value = m.birth || '';
  document.getElementById('city').value = m.city || '';
  document.getElementById('bio').value = m.bio || '';
}

function deleteMember(id) {
  members = members.filter(x=>x.id!==id);
  renderList();
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const idField = document.getElementById('id');
  const name = document.getElementById('name').value.trim();
  const birth = document.getElementById('birth').value.trim();
  const city = document.getElementById('city').value.trim();
  const bio = document.getElementById('bio').value.trim();
  const file = document.getElementById('photofile').files[0];

  let photoValue = 'images/placeholder.png';
  if (file) {
    photoValue = await fileToDataURL(file); // base64
  }

  if (idField.value) {
    // تعديل
    const idx = members.findIndex(x => x.id === idField.value);
    if (idx !== -1) {
      members[idx] = {...members[idx], name, birth, city, bio, photo: photoValue};
    }
  } else {
    // إضافة
    const newId = 'm' + Date.now();
    members.push({id: newId, name, birth, city, bio, photo: photoValue});
  }

  clearForm();
  renderList();
});

function clearForm() {
  document.getElementById('id').value = '';
  document.getElementById('name').value = '';
  document.getElementById('birth').value = '';
  document.getElementById('city').value = '';
  document.getElementById('bio').value = '';
  document.getElementById('photofile').value = '';
}

document.getElementById('clear').onclick = clearForm;

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = () => rej('خطأ بقراءة الصورة');
    reader.readAsDataURL(file);
  });
}

document.getElementById('export').onclick = () => {
  const blob = new Blob([JSON.stringify(members, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'members.json';
  a.click();
};

document.getElementById('importFile').addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const arr = JSON.parse(reader.result);
      if (!Array.isArray(arr)) throw 'ملف غير صحيح';
      members = arr;
      renderList();
      alert('تم استيراد البيانات محليًا. لا تنسى رفع ملف members.json إلى المستودع.');
    } catch (err) {
      alert('خطأ في استيراد الملف: ' + err);
    }
  };
  reader.readAsText(f);
});

init();
