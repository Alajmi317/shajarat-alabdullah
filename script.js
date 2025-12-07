async function loadMembers() {
  const res = await fetch('members.json');
  const members = await res.json();
  const container = document.getElementById('members');
  container.innerHTML = '';
  members.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${m.photo}" alt="${m.name}" class="thumb" />
      <h3>${m.name}</h3>
      <p>${m.city || ''} · ${m.birth ? m.birth.split('-')[0] : ''}</p>
      <p class="bio">${(m.bio || '').slice(0,80)}</p>
      <a class="view-link" href="member.html?id=${m.id}">عرض الهوية</a>
    `;
    container.appendChild(card);
  });
}

loadMembers();


  function renderTree() {
  let tree = document.getElementById("tree");
  tree.innerHTML = "";

  // اجلب الجذور (اللي ما لهم أب)
  let roots = people.filter(p => !p.fatherId);

  roots.forEach(root => {
    tree.innerHTML += `
      <div class="tree-item root">
        <div class="person-name">${root.name}</div>
      </div>
    `;

    let children = people.filter(ch => ch.fatherId == root.id);
    children.forEach(child => {
      tree.innerHTML += `
        <div class="tree-item child">
          <div class="person-name">└─ الابن: ${child.name}</div>
        </div>
      `;

      let grand = people.filter(g => g.fatherId == child.id);
      grand.forEach(g => {
        tree.innerHTML += `
          <div class="tree-item grand">
            <div class="person-name">  └─ الحفيد: ${g.name}</div>
          </div>
        `;
      });
    });
  });
}
