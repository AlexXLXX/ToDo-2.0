"use strict";
const input = document.querySelector(".main-input");
const btnAdd = document.querySelector(".btn-add");
const taskList = document.querySelector(".list");

updateTasksList();

btnAdd.addEventListener("click", addTask);
taskList.addEventListener("click", deleteTask);
input.addEventListener("input", () => {
  input.style.height = ``;
  input.style.height = `${input.scrollHeight + 2}px`;
});
// taskList.addEventListener("pointermove", moveDragElement);

function getTasksToLocalStorage() {
  const tasksJSON = localStorage.getItem("tasks");
  return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function setTasksToLocalStorage(arr) {
  localStorage.setItem("tasks", JSON.stringify(arr));
}

function updateTasksList() {
  taskList.textContent = "";
  const arrLS = getTasksToLocalStorage();
  renderTasksList(arrLS);
}

function renderTasksList(tasks) {
  if (!tasks || !tasks.length) return;
  tasks
    .sort((a, b) => a.position - b.position)
    .forEach((element, index) => {
      const taskTemplate = `
      <li class="list__li" data-task-id="${element.id}" data-id="${element.id}">
      <span class="list__li__number">${index + 1}. </span>
      <span class="list__li__text" data-action="text">${element.text}</span>
      <button class="list__li__btn-dnd" data-action="dnd"><img src="https://img.icons8.com/ios-filled/50/FFFFFF/sorting-arrows.png" alt="sorting-arrows"/></button>
      <button class="list__li__btn-delete" data-action="delete"><img src="https://img.icons8.com/wired/64/FFFFFF/multiply.png" alt="multiply"/></button>
    </li>
    `;
      taskList.insertAdjacentHTML("beforeend", taskTemplate);
    });

  // activationDrag();
}

function addTask() {
  const taskText = input.value.trim().replace(/\s+/g, " ");
  if (taskText === "") return;

  const tasks = getTasksToLocalStorage();
  tasks.unshift({
    id: Number(new Date()),
    text: taskText,
    position: -1000,
  });

  input.value = "";
  input.style.height = ``;
  setTasksToLocalStorage(tasks);
  updateTasksList();
}

function deleteTask(e) {
  if (e.target.dataset.action === "delete") {
    const parentNode = e.target.closest(".list__li");
    const id = Number(parentNode.dataset.taskId);
    const arrLS = getTasksToLocalStorage();

    const newArr = arrLS.filter((el) => el.id !== id);
    setTasksToLocalStorage(newArr);
    updateTasksList();
  }
}

taskList.addEventListener("dblclick", editTaskText);
taskList.addEventListener("touchstart", editTaskTextByDobleTouch);
function editTaskText(event) {
  const task = event.target;
  const parentNode = event.target.closest(".list__li");
  const id = Number(parentNode.dataset.taskId);
  const arrLS = getTasksToLocalStorage();
  const taskArr = arrLS.find((el) => el.id === id);

  if (task.dataset.action === "text") {
    const newInput = document.createElement("textarea");
    newInput.className = "newInput";

    task.replaceWith(newInput);
    newInput.focus();
    newInput.value = task.textContent;
    newInput.style.height = `${newInput.scrollHeight + 2}px`;
    newInput.addEventListener("input", () => {
      newInput.style.height = ``;
      newInput.style.height = `${newInput.scrollHeight + 2}px`;
    });

    function save() {
      newInput.replaceWith(task);
      task.textContent = newInput.value;
      taskArr.text = task.textContent;
      setTasksToLocalStorage(arrLS);
      return;
    }

    newInput.addEventListener("blur", function () {
      if (newInput.value === "" || newInput.value.trim().length === 0) {
        alert("Задача не может быть пустой");
        newInput.replaceWith(task);
        return;
      }
      save();
    });

    newInput.addEventListener("keydown", function (e) {
      if (e.keyCode === 13) {
        newInput.blur();
      } else if (e.keyCode == 27) {
        newInput.value = task.textContent;
        newInput.blur();
        return;
      }
    });
  }
}

function editTaskTextByDobleTouch(e) {
  let expired;
  if (e.touches.length === 1) {
    if (!expired) {
      expired = e.timeStamp + 400;
    } else if (e.timeStamp <= expired) {
      e.preventDefault();
      editTaskText();
      expired = null;
    } else {
      expired = e.timeStamp + 400;
    }
  }
}

new Sortable(taskList, {
  sort: true,  // sorting inside list
	delay: 400, // time in milliseconds to define when the sorting should start
	delayOnTouchOnly: true,
  handle: '.list__li__btn-dnd', // handle's class
  animation: 250,
  ghostClass: 'dragging',
  chosenClass: 'dragging',
  forceFallback: true,
  scroll: true,
  bubbleScroll: true,
  onSort: function (){
    const arrLS = getTasksToLocalStorage();
    const arrTasks = [...document.querySelectorAll(".list__li")];

   arrTasks.forEach((item, i) => {
      const id = Number(item.dataset.taskId);
      const index = arrLS.findIndex((value) => value.id === id);
      if (index !== -1) {
       arrLS[index].position = i;
     }
  });
  setTasksToLocalStorage(arrLS);
  updateTasksList();
},
 });
