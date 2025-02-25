import { useState, useEffect } from 'react'
import personService from './services/persons';
import Notification from './Notification';

const Filter = ({ search, handleSearch }) => (
  <div>
    filter shown with <input value={search} onChange={handleSearch} />
  </div>
)

const PersonForm = ({ addPerson, newName, handleNameChange, newNumber, handleNumberChange }) => (
  <form onSubmit={addPerson}>
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    <div>
      number: <input value={newNumber} onChange={handleNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Persons = ({ persons, deletePerson }) => (
  <ul>
    {persons.map((person) => (
      <li key={person.id}>{person.name} {person.number}
        <button onClick={() => deletePerson(person)}>delete</button>
      </li>
    ))}
  </ul>
)

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState({ message: null, type: null });

  useEffect(() => {
    personService.getAll().then(fetchedPersons => setPersons(fetchedPersons));
  }, []);

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = { name: newName, number: newNumber };
    const existingPerson = persons.find(person => person.name === newName);

    if (persons.some(person => person.name === newName)) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        personService
          .update(existingPerson.id, personObject)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id !== existingPerson.id ? person : returnedPerson));
            showNotification(`Updated ${returnedPerson.name}'s number`, 'success');
            setNewName('');
            setNewNumber('');
          }).catch(() => {
            showNotification(`Information of ${newName} has already been removed from server`, 'error');
            setPersons(persons.filter(person => person.id !== existingPerson.id));
          });
      }
    } else {
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson));
          showNotification(`Added ${returnedPerson.name}`, 'success');
          setNewName('');
          setNewNumber('');
        }).catch(error => {
          showNotification(error.response.data.error, 'error');
        });
    }
  };

  const deletePerson = (person) => {
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService.remove(person.id).then(() => {
        setPersons(persons.filter(p => p.id !== person.id));
        showNotification(`Deleted ${person.name}`, 'success');
      }).catch(() => {
        showNotification(`Information of ${person.name} has already been removed from server`, 'error');
        setPersons(persons.filter(p => p.id !== person.id));
      });
    }
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearch = (event) => {
    setSearch(event.target.value)
  }

  const personsFiltered = persons.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase())
  )

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: null, type: null }), 3000);
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification.message} type={notification.type} />
      <Filter search={search} handleSearch={handleSearch} />
      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      <Persons persons={personsFiltered} deletePerson={deletePerson} />
    </div>
  )

}

export default App