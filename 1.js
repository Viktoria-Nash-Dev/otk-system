// 1. НАСТРОЙКА FIREBASE (Вставь свои данные!)
const firebaseConfig = {
  databaseURL:
    "https://otk-system-default-rtdb.europe-west1.firebasedatabase.app/",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 2. ЭЛЕМЕНТЫ ИНТЕРФЕЙСА
const fab = document.getElementById('fab-add');
const adminPanel = document.getElementById('admin-panel');
const btnSave = document.getElementById('btn-save');
const detailList = document.getElementById('detail-list');

// 3. ФУНКЦИЯ СОЗДАНИЯ КАРТОЧКИ (Добавили ID для удаления)
function createCard(id, data) {
    const li = document.createElement('li');
    li.className = 'card';
    li.dataset.id = id; // Запоминаем ID записи в базе

    const statusClass = { 'success': 'status-ok', 'defect': 'status-fail', 'paused': 'status-pause' }[data.status];

    li.innerHTML = `
        <div class="card-main">
            <span class="col-part">${data.part}</span>
            <span class="col-op">${data.op}</span>
            <span class="status-badge ${statusClass}"></span>
            <span class="col-date">${data.date}</span>
            <span class="col-user">${data.user}</span>
        </div>
        <div class="card-details">
            <div class="details-content">
                <strong>Комментарий:</strong> ${data.comment || "Нет примечаний"}
            </div>
            <button class="btn-delete-hidden" onclick="deleteEntry('${id}')">Удалить запись</button>
        </div>
    `;

    li.onclick = () => li.classList.toggle('expanded');
    detailList.prepend(li);
}

// 4. СОХРАНЕНИЕ В ОБЛАКО
btnSave.onclick = () => {
    const part = document.getElementById('part-name').value;
    const op = document.getElementById('op-number').value;
    const controller = document.getElementById('controller-name').value;
    const comment = document.getElementById('comment-text').value;

    if (!part||!op||!controller) return alert("Заполни поля!");

    const newEntry = {
        part: part,
        op: op,
        user: controller,
        status: document.getElementById('status-select').value,
        comment: comment,
        date: new Date().toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'})
    };

    // Отправляем в Firebase
    db.ref('entries').push(newEntry);

    // Очистка
    adminPanel.classList.remove('active');
    fab.classList.remove('rotate');
};

// 5. УДАЛЕНИЕ ИЗ ОБЛАКА
function deleteEntry(id) {
    if (confirm("Удалить запись из общей базы?")) {
        db.ref('entries/' + id).remove();
    }
}

// 6. СЛУШАТЕЛЬ ОБЛАКА (Магия: обновляет у всех сразу!)
db.ref('entries').on('value', (snapshot) => {
    detailList.innerHTML = ""; // Очищаем список перед перерисовкой
    const data = snapshot.val();
    if (data) {
        Object.keys(data).forEach(id => {
            createCard(id, data[id]);
        });
    }
});

// Переключатели режимов (остаются как были)
document.getElementById('btn-worker').onclick = () => { fab.style.display = 'none'; adminPanel.classList.remove('active'); };
document.getElementById('btn-controller').onclick = () => { fab.style.display = 'flex'; };
fab.onclick = () => { adminPanel.classList.toggle('active'); fab.classList.toggle('rotate'); };