const bookForm = document.getElementById('book-form');
const bookTitle = document.getElementById('title');
const bookAuthor = document.getElementById('author');
const bookYear = document.getElementById('year');
const bookIsComplete = document.getElementById('isComplete');
const bookSubmitButton = document.querySelector('.btn');
const formCard = document.querySelector('.form-card');

const read = document.getElementById('read');
const unread = document.getElementById('unread');

const bookSearch = document.getElementById('searchBook');


const books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
const SAVED_EVENT = 'saved-book';

function generateId(){
  return +new Date();
}

function generateBookToObject(id, title, author, year, isComplete){
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function addBookToObject(){
  const id = generateId();
  const title = bookTitle.value;
  const author = bookAuthor.value;
  const year = parseInt(bookYear.value);
  const isComplete = bookIsComplete.checked;

  const book = generateBookToObject(id, title, author, year, isComplete);
  books.push(book);

  formCard.classList.remove('form-edit')
  formCard.classList.add('form-noEdit')
  bookSubmitButton.innerHTML = 'Add Book'

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function showBookToDOM(bookObject) {

  const {id, title, author, year, isComplete} = bookObject;

  const textTitle = document.createElement('h3')
  textTitle.innerText = title
  const textAuthor = document.createElement('h4')
  textAuthor.innerText = author
  const textYear = document.createElement('h5')
  textYear.innerText = year

  const bookCard = document.createElement('li')
  bookCard.classList.add('book-card')
  const divText = document.createElement('div')
  divText.classList.add('card-text')
  divText.append(textTitle, textAuthor, textYear)

  const divButton = document.createElement('div')
  divButton.classList.add('card-button')

  const undoButton = createButton('undo-button')
  undoButton.addEventListener('click', () => undoToUnread(id))
  const trashButton = createButton('trash-button')
  trashButton.addEventListener('click', () => removeBook(id))
  const checkButton = createButton('check-button')
  checkButton.addEventListener('click', () => checkedBook(id))
  const editButton = createButton('edit-button')
  editButton.addEventListener('click', () => editBook(id))

  if (isComplete === false) {
    divButton.append(checkButton,editButton, trashButton)
  } else {
    divButton.append(undoButton,editButton, trashButton)
  }

  bookCard.append(divText, divButton)
  bookCard.setAttribute('id', `book-${id}`)

  return bookCard
}

function createButton(classes){
  const button = document.createElement('button')
  button.classList.add(classes)
  return button
}

function findBook(id){
  for(const book of books){
    if(book.id === id){
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId){
  for(const index in books){
    if(books[index].id === bookId){
      return index;
    }
  }
  return -1;
}

function undoToUnread(bookId) {
  const bookTarget = findBook(bookId)

  if (bookTarget === null) return
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId)
  if (bookTarget === -1) return
  if (confirm('Are you sure want to delete this book?')) {
    books.splice(bookTarget, 1)
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  saveData();
}

function editBook(bookId) {
  formCard.classList.remove('form-noEdit')
  formCard.classList.add('form-edit')
  bookSubmitButton.innerHTML = 'Update Book'

  const bookTarget = findBook(bookId)
  if (bookTarget === null) return

  const bookIndex = findBookIndex(bookId)
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1)
  }

  bookTitle.value = bookTarget.title
  bookAuthor.value = bookTarget.author
  bookYear.value = bookTarget.year
  bookIsComplete.checked = bookTarget.isComplete

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function checkedBook(bookId){
  const bookTarget = findBook(bookId)
  if (bookTarget === null) return
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function searchBook(e) {
  const bookList = document.querySelectorAll('.book-card');
  const searchValue = e.target.value.toLowerCase();

  bookList.forEach((book) => {
    const bookTitle = book.firstElementChild.firstElementChild.textContent.toLowerCase();

    if (bookTitle.indexOf(searchValue) !== -1) {
      book.style.display = 'flex'
    }else{
      book.style.display = 'none'
    }
  })

}

bookSearch.addEventListener('input', searchBook)

function checkUI() {
  const bookListRead = read.querySelectorAll('li');
  const bookListUnread = unread.querySelectorAll('li');
  if (bookListRead.length === 0 && bookListUnread.length === 0) {
    bookSearch.style.display = 'none'
  }else{
    bookSearch.style.display = 'block'
  }
}

function isStorageExist() {
  if (typeof(Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage')
    return false
  }

  return true
}

function saveData(){
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage(){
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if(data !== null){
    books.splice(0, books.length, ...data);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}


document.addEventListener('DOMContentLoaded', () => {
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (bookTitle.value === '' || bookAuthor.value === '' || bookYear.value === '') {
      alert('Please fill the form')
      return
    }

    addBookToObject();

    bookTitle.value = ''
    bookAuthor.value = ''
    bookYear.value = ''
    bookIsComplete.checked = false

    checkUI();
  })

  if(isStorageExist()){
    loadDataFromStorage();
  }

})

document.addEventListener(RENDER_EVENT, () =>{
  unread.innerHTML = '';
  read.innerHTML = '';

  for(const book of books){
    const bookElement = showBookToDOM(book);
    if(book.isComplete){
      read.append(bookElement);
    } else {
      unread.append(bookElement);
    }
  }

  checkUI();

})

checkUI();
