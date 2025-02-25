const mongoose = require('mongoose')
const supertest = require('supertest')
const { server } = require('../index')
const Person = require('../models/person')

const api = supertest(server)

beforeEach(async () => {
  await Person.deleteMany({})

  const persons = [
    { name: 'Tester1', number: '12-3456789' },
    { name: 'Tester2', number: '123-4567890' }
  ]

  await Person.insertMany(persons)
})

test('GET /api/persons returns all persons', async () => {
  const response = await api.get('/api/persons').expect(200).expect('Content-Type', /application\/json/)
  expect(response.body).toHaveLength(2)
})

test('GET /api/persons/:id returns a valid person', async () => {
  const persons = await Person.find({})
  const person = persons[0]

  const response = await api.get(`/api/persons/${person.id}`).expect(200).expect('Content-Type', /application\/json/)
  expect(response.body.name).toBe(person.name)
})

test('POST /api/persons creates a new person with valid number format (XX-XXXXXXX)', async () => {
  const newPerson = { name: 'Tester3', number: '45-6789123' }

  await api.post('/api/persons').send(newPerson).expect(201).expect('Content-Type', /application\/json/)

  const personsAfter = await Person.find({})
  expect(personsAfter).toHaveLength(3)

  const names = personsAfter.map(p => p.name)
  expect(names).toContain('Tester3')
})

test('POST /api/persons creates a new person with valid number format (XXX-XXXXXXXX)', async () => {
  const newPerson = { name: 'Tester4', number: '456-78912345' }

  await api.post('/api/persons').send(newPerson).expect(201).expect('Content-Type', /application\/json/)

  const personsAfter = await Person.find({})
  expect(personsAfter).toHaveLength(3)

  const names = personsAfter.map(p => p.name)
  expect(names).toContain('Tester4')
})

test('POST /api/persons fails if name is missing', async () => {
  const newPerson = { number: '45-6789123' }

  const response = await api.post('/api/persons').send(newPerson).expect(400)
  expect(response.body.error).toBe('Missing name or number')
})

test('POST /api/persons fails if number format is invalid', async () => {
  const newPerson = { name: 'Tester5', number: '123456' }

  const response = await api.post('/api/persons').send(newPerson).expect(400)
  expect(response.body.error).toMatch(/shorter than the minimum allowed length/)
})

test('PUT /api/persons/:id updates a person\'s number', async () => {
  const persons = await Person.find({})
  const person = persons[0]

  const updatedPerson = { name: person.name, number: '99-9999999' }

  const response = await api.put(`/api/persons/${person.id}`).send(updatedPerson).expect(200)
  expect(response.body.number).toBe('99-9999999')
})

test('DELETE /api/persons/:id removes a person', async () => {
  const persons = await Person.find({})
  const person = persons[0]

  await api.delete(`/api/persons/${person.id}`).expect(204)

  const personsAfter = await Person.find({})
  expect(personsAfter).toHaveLength(1)
})

afterAll(async () => {
  await mongoose.connection.close()
  server.close()
})
