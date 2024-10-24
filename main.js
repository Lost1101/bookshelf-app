const books = [];
let filteredBooks = books;
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF';

function isStorageExist(){
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
};

document.addEventListener('DOMContentLoaded', function() {
    const submit = document.getElementById('bookForm');
    submit.addEventListener('submit', function(event){
        event.preventDefault();
        addBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBook = document.getElementById('incompleteBookList');
    uncompletedBook.innerHTML = '';

    const completeBook = document.getElementById('completeBookList');
    completeBook.innerHTML = '';

    for (const bookItem of filteredBooks) {
        const bookElement = makeBook(bookItem);
        if(bookItem.isComplete){
            completeBook.append(bookElement);
        } else {
            uncompletedBook.append(bookElement);
        };
    };
});

const searchForm = document.getElementById('searchBook');
searchForm.addEventListener('submit', function(event){
    event.preventDefault();
    const searchInput = document.getElementById('searchBookTitle');
    const searchQuery = document.getElementById('searchBookTitle').value;
    searchBooks(searchQuery);

    searchInput.value = '';
});

function generateId() {
    return +new Date().getTime();
};

function addBook() {
    const titleBook = document.getElementById('bookFormTitle').value;
    const authorBook = document.getElementById('bookFormAuthor').value;
    const yearBook = parseInt(document.getElementById('bookFormYear').value);
    const completeBook = document.getElementById('bookFormIsComplete').checked;
   
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, titleBook, authorBook, yearBook, completeBook);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    showToast('Berhasil menambahkan buku!');
    saveData();
};

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
        for (const book of data) {
            books.push(book);
        };
    };
   
    document.dispatchEvent(new Event(RENDER_EVENT));
};

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
};

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
};

function makeBook(bookObject) {
    const bookTitle = document.createElement('h3');
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookTitle.innerText = bookObject.title;
    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookAuthor.innerText = `Author : ${bookObject.author}`;
    const bookYear = document.createElement('p');
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookYear.innerText = `Year : ${bookObject.year}`;

    const buttonComplete = document.createElement('button');
    if(!bookObject.isComplete){
        buttonComplete.setAttribute('data-testid', 'bookItemIsCompleteButton');
        buttonComplete.innerText = 'Completed';
        buttonComplete.setAttribute('class', 'button');
        buttonComplete.addEventListener('click', function(){
            completeBook(bookObject.id);
        });
    } else {
        buttonComplete.setAttribute('data-testid', 'bookItemIsNotCompleteButton');
        buttonComplete.setAttribute('class', 'button');
        buttonComplete.innerText = 'Incomplete';
        buttonComplete.addEventListener('click', function(){
            incompleteBook(bookObject.id);
        });
    };

    const buttonDelete = document.createElement('button');
    buttonDelete.setAttribute('data-testid', 'bookItemDeleteButton');
    buttonDelete.setAttribute('class', 'button');
    buttonDelete.innerText = 'Delete';
    buttonDelete.addEventListener('click', function(){
        if (confirm('Apakah kamu mau hapus buku ini?')){
            deleteBook(bookObject.id);
        }
    });

    const buttonEdit = document.createElement('button');
    buttonEdit.setAttribute('data-testid', 'bookItemEditButton');
    buttonEdit.setAttribute('class', 'button');
    buttonEdit.innerText = 'Edit';
    buttonEdit.addEventListener('click', function(){
        showEdit(bookObject);
    });

    const buttonList = document.createElement('div');
    buttonList.append(buttonComplete, buttonDelete, buttonEdit);

    const bookList = document.createElement('div');
    bookList.setAttribute('data-bookid', `${bookObject.id}`);
    bookList.setAttribute('data-testid', 'bookItem');
    bookList.setAttribute('class', 'book');
    bookList.append(bookTitle, bookAuthor, bookYear, buttonList);

    return bookList;
};

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) return bookItem;
    }
    return null;
};

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) return index;
    }
    return null;
};

function completeBook(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function incompleteBook(bookId){
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function deleteBook(bookId){
    const bookIndex = findBookIndex(bookId);

    if(bookIndex === -1) return;

    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    showToast('Buku berhasil dihapus!');
};

function searchBooks(searchQuery) {
    filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    document.dispatchEvent(new Event(RENDER_EVENT));
};

function showEdit(data){
    toggleModal(true);

    const buttonCloseModal = document.getElementById('closeModal');
    buttonCloseModal.addEventListener('click', function(){
        toggleModal(false);
    });

    const titleElement = document.createElement('h2');
    titleElement.innerText = 'Edit Book';

    const inputTitleLabel = document.createElement('label');
    inputTitleLabel.setAttribute('for', 'editBookTitle');
    inputTitleLabel.innerText = 'Title';
    const inputTitle = document.createElement('input');
    inputTitle.setAttribute('id', 'editBookTitle');
    inputTitle.setAttribute('type', 'text');
    inputTitle.setAttribute('required', '');
    inputTitle.value = data.title;
    
    const inputAuthorLabel = document.createElement('label');
    inputAuthorLabel.setAttribute('for', 'editBookAuthor');
    inputAuthorLabel.innerText = 'Author';
    const inputAuthor = document.createElement('input');
    inputAuthor.setAttribute('id', 'editBookAuthor');
    inputAuthor.setAttribute('type', 'text');
    inputAuthor.setAttribute('required', '');
    inputAuthor.value = data.author;

    const inputYearLabel = document.createElement('label');
    inputYearLabel.setAttribute('for', 'editBookYear');
    inputYearLabel.innerText = 'Year';
    const inputYear = document.createElement('input');
    inputYear.setAttribute('id', 'editBookYear');
    inputYear.setAttribute('type', 'number');
    inputYear.setAttribute('required', '');
    inputYear.value = data.year;

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'editButtonForm');
    editButton.setAttribute('id', 'editButtonForm');
    editButton.setAttribute('type', 'submit');
    editButton.setAttribute('class', 'button');
    editButton.innerText = 'Edit';

    const formEdit = document.createElement('form');
    formEdit.setAttribute('data-testid', 'editBookForm');
    formEdit.setAttribute('id', 'editBookForm');
    formEdit.setAttribute('class', 'form');
    formEdit.append(inputTitleLabel, inputTitle, inputAuthorLabel, inputAuthor, inputYearLabel, inputYear, editButton);

    formEdit.addEventListener('submit', function(event) {
        event.preventDefault();
        editBook(data.id);
    });

    const editSection = document.getElementById('editBook')
    editSection.innerHTML = '';
    editSection.append(titleElement, formEdit);

    return editSection;
};

function editBook(bookId){
    const titleValue = document.getElementById('editBookTitle').value;
    const authorValue = document.getElementById('editBookAuthor').value;
    const yearValue = parseInt(document.getElementById('editBookYear').value);
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.title = titleValue;
    bookTarget.author = authorValue;
    bookTarget.year = yearValue;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    toggleModal(false);

    showToast('Buku berhasil diedit!');
};

function showToast(message) {
    const TOAST_DURATION = 3000;
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerText = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, TOAST_DURATION);
};

function toggleModal(isVisible) {
    const shadow = document.getElementById('shadow');
    const modal = document.getElementsByClassName('modal')[0];

    const displayValue = isVisible ? 'block' : 'none';
    shadow.style.display = displayValue;
    modal.style.display = displayValue;
};