const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());
app.use('/repositories/:id', validateUuid)

function validateUuid(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id))
    return response.status(400).json({ error: 'Invalid ID.'})
  
  return next()
}

function dataValidation(request, response, next) {
  const { title, url, techs } = request.body;

  if(typeof title != "string")
    return response.status(400).json({error: "Title must be a non-empty string"})

  if(typeof url != "string")
    return response.status(400).json({error: "Url must be a non-empty string"})
  
  if(typeof techs != "object")
    return response.status(400).json({error: "Techs must be an array of technologies"})

  return next()
}

function getRepositoryIndex(id) {
  return repositories.findIndex(repository => repository.id === id)
}

const repositories = [];

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", dataValidation, (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository)

  return response.json(repository)
});

app.put("/repositories/:id", dataValidation, (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndex(id)

  if(repositoryIndex < 0)
    return response.status(400).json({error: 'Repository not found.'})

  const { title, url, techs } = request.body;

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositoryIndex].likes
  }

  repositories[repositoryIndex] = repository

  return response.json(repository)
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndex(id)

  if(repositoryIndex < 0)
    return response.status(400).json({error: 'Repository not found.'})

  repositories[repositoryIndex].likes += 1
  return response.json(repositories[repositoryIndex])
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = getRepositoryIndex(id)

  if(repositoryIndex < 0)
    return response.status(400).json({error: 'Repository not found.'})

  repositories.splice(repositoryIndex, 1)

  return response.status(204).send()
});

module.exports = app;