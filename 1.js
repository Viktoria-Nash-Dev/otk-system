const firebaseConfig = {
  databaseURL: "https://otk-system-default-rtdb.europe-west1.firebasedatabase.app/",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const fab = document.getElementById('fab-add');
const adminPanel = document.getElementById('admin-panel');
const btnSave = document.getElementById('btn-save');
const detailList = document.getElementById('detail-list');
const btnWorker = document.getElementById('btn-worker');
const btnController = document.getElementById('btn-controller');

// По умолчанию кнопка "+" скрыта (режим рабочих)
fab.style.display = 'none';

function createCard(id, data) {
    const li = document.createElement('li');
    li.dataset.id = id;
    const statusClass = { 'success': 'status-ok', 'defect': 'status-fail', 'paused': 'status-pause' }[data.status];

    li.innerHTML = 
       <div class="card-main">
            <span class="col-part">${data.part}</span>
            <span class="col-op">${data.op}</span>
            <div class="status-badge ${statusClass}"></div>
            <span class="col-date">${data.date}</span>
            <span class="col-user">${data.user}</span>
        </div >;
        <div class="card-details">
            <div><strong>Комментарий:</strong> ${data.comment || "Нет"}</div>
            <button class="btn-delete-hidden" onclick="deleteEntry(event, '${id}')">Удалить запись</button>
        </div>;

    li.onclick = () => li.classList.toggle('expanded');
    detailList.prepend(li);
}

function deleteEntry(event, id) {
    event.stopPropagation(); // Чтобы карточка не закрывалась при удалении
    if (confirm("Удалить запись?")) {
        db.ref('entries/' + id).remove();
    }
}

// Сохранение
btnSave.onclick = () => {
    const newEntry = {
        part: document.getElementById('part-name').value,
        op: document.getElementById('op-number').value,
        user: document.getElementById('controller-name').value,
        status: document.getElementById('status-select').value,
        comment: document.getElementById('comment-text').value,
        date: new Date().toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'})
    };
    if (!newEntry.part || !newEntry.user) return alert("Заполните данные");
    db.ref('entries').push(newEntry);
    adminPanel.classList.remove('active');
};

// Обновление списка
db.ref('entries').on('value', (snapshot) => {
    detailList.innerHTML = "";
    const data = snapshot.val();
    if (data) Object.keys(data).forEach(id => createCard(id, data[id]));
});

// ПЕРЕКЛЮЧАТЕЛИ (Исправлено)
btnWorker.onclick = () => {
    document.body.classList.add('worker-mode');
    btnWorker.classList.add('active');
    btnController.classList.remove('active');
    fab.style.display = 'none';
    adminPanel.classList.remove('active');
};

btnController.onclick = () => {
    document.body.classList.remove('worker-mode');
    btnController.classList.add('active');
    btnWorker.classList.remove('active');
    fab.style.display = 'flex';
};

fab.onclick = () => adminPanel.classList.toggle('active'); // Без rotate