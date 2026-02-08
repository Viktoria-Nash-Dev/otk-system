const fab = document.getElementById('fab-add');
const adminPanel = document.getElementById('admin-panel');
const btnSave = document.getElementById('btn-save');
const inputPart = document.getElementById('part-name');
const inputOp = document.getElementById('op-number');
const inputController = document.getElementById('controller-name');
const inputComment = document.getElementById('comment-text');
const selectStatus = document.getElementById('status-select');
const detailList = document.getElementById('detail-list');
const btnWorker = document.getElementById('btn-worker');
const btnController = document.getElementById('btn-controller');

function createCard(partName, opNumber, status, date, controller, comment = "") {
    const li = document.createElement('li');
    li.className = 'card';

    const statusClass = {
        'success': 'status-ok',
        'defect': 'status-fail',
        'paused': 'status-pause'
    }[status] || 'status-pause';

    li.innerHTML = `
        <div class="card-main">
            <span class="col-part">${partName}</span>
            <span class="col-op">${opNumber}</span>
            <span class="status-badge ${statusClass}"></span>
            <span class="col-date">${date}</span>
            <span class="col-user">${controller}</span>
        </div>
        <div class="card-details">
            <div class="details-content">
                <strong>Комментарий:</strong> ${comment || "Нет примечаний"}
            </div>
            <button class="btn-delete-hidden">Удалить запись</button>
        </div>
    `;

    const deleteBtn = li.querySelector('.btn-delete-hidden');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (confirm(`Удалить запись по детали ${partName}?`)) {
            li.remove();
            removeFromStorage(partName, opNumber, date);
        }
    });

    li.addEventListener('click', () => li.classList.toggle('expanded'));
    detailList.prepend(li);
}


function removeFromStorage(part, op, date) {
    let history = JSON.parse(localStorage.getItem('otk_history') || '[]');
    history = history.filter(item => !(item.part === part && item.op === op && item.date === date));
    localStorage.setItem('otk_history', JSON.stringify(history));
}

fab.addEventListener('click', () => {
    adminPanel.classList.toggle('active');
    fab.classList.toggle('rotate');
});

btnWorker.addEventListener('click', () => {
    btnWorker.classList.add('active');
    btnController.classList.remove('active');
    fab.style.display = 'none';
    adminPanel.classList.remove('active');
    const deleteButtons = document.querySelectorAll(".btn-delete-hidden");
    deleteButtons.forEach((btn) => (btn.style.display = "none"));
});

btnController.addEventListener('click', () => {
    btnController.classList.add('active');
    btnWorker.classList.remove('active');
    fab.style.display = 'flex';
    const deleteButtons = document.querySelectorAll(".btn-delete-hidden");
    deleteButtons.forEach((btn) => (btn.style.display = "block"));
});

btnSave.addEventListener('click', () => {
    const part = inputPart.value;
    const op = inputOp.value;
    const status = selectStatus.value;
    const controller = inputController.value;
    const comment = inputComment.value;
    const date = new Date().toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'});

    if (!part||!op||!controller) {
        alert("Заполни название, номер операции и фамилию!");
        return;
    }

    createCard(part, op, status, date, controller, comment);

    const entry = { part, op, status, date, user: controller, comment };
    const history = JSON.parse(localStorage.getItem('otk_history') || '[]');
    history.push(entry);
    localStorage.setItem('otk_history', JSON.stringify(history));
    
    inputPart.value = "";
    inputOp.value = "";
    inputController.value = "";
    inputComment.value = "";
    adminPanel.classList.remove('active');
    fab.classList.remove('rotate');
});
window.onload = () => {
    const history = JSON.parse(localStorage.getItem('otk_history') || '[]');
    history.forEach(item => {
        createCard(item.part, item.op, item.status, item.date, item.user, item.comment);
    });
};