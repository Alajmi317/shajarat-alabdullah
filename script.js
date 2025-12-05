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
