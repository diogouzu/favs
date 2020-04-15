import api from './api'

class App {
    constructor() {
        this.repositories = JSON.parse(localStorage.getItem('repo_list')) || []

        this.buttonSubmit = document.querySelector('#submit')
        this.nameInput = document.querySelector('#user')
        this.repositoryInput = document.querySelector('#repository')
        this.listElement = document.querySelector('.repositories-list')
        this.statusContainer = document.querySelector('.status')
        this.progressBarContainer = document.querySelector('.progress-container')

        this.requestListener()
        this.getRepoList()
    }

    requestListener() {
        this.buttonSubmit.onclick = event => this.checkRequest(event)
    }

    getRepoList() {
        this.listElement.innerHTML = ''

        this.repositories.forEach(repo => {
            const itemElement = document.createElement('div')
            itemElement.classList.add('box')

            itemElement.innerHTML =
                `<article class="media">
                    <div class="media-left">
                        <figure class="image is-64x64">
                            <img src="${repo.avatar_url}" alt="Image">
                        </figure>
                    </div>
                    <div class="media-content">
                        <div class="content">
                            <p>
                                <strong>${repo.name}</strong> <small>${repo.full_name}</small>
                                <br>
                                ${repo.description}
                            </p>
                        </div>
                        <nav class="level is-mobile">
                            <div class="level-left">
                                <a class="level-item" href="${repo.html_url}" target="_blank">
                                    <span class="icon is-small">
                                        <i class="fas fa-link" aria-hidden="true"></i> 
                                    </span> 
                                </a>
                                <a class="level-item" data-repo="${repo.full_name}">
                                    <span class="icon is-small">
                                        <i class="fas fa-trash" aria-hidden="true"></i>
                                    </span>
                                </a>
                                <a class="level-item" href="https://github.com/${repo.full_name}/archive/master.zip">
                                    <span class="icon is-small">
                                        <i class="fas fa-download" aria-hidden="true"></i>
                                    </span>
                                </a>
                            </div>
                        </nav>
                    </div>
                </article>`

            this.listElement.appendChild(itemElement)

            const removeItem = document.querySelector(`[data-repo="${repo.full_name}"]`);

            removeItem.addEventListener('click', () => {
                this.repositories.splice(repo, 1);
                this.getRepoList()
                this.saveToStorage()
            });
        })
    }

    checkInput(id) {
        let alertElement = document.querySelector(`#${id}`)

        alertElement.classList.add('is-danger')

        setTimeout(() => { alertElement.classList.remove('is-danger') }, 4000);
    }

    progressbar(loading = true) {
        if (loading === true) {
            this.progressBarContainer.innerHTML = `
            <div class="progress-bar">
                <progress class="progress is-small is-dark" max="100">1%</progress>
            </div>`}
        else {
            this.progressBarContainer.innerHTML = ``
        }

    }

    alertMessage(type, msg) {
        let message = document.createElement('article')
        message.classList.add('message', `is-${type}`)

        message.innerHTML = `
        <div class="message-body">
            ${msg}
        </div>`

        setTimeout(function () { message.innerHTML = `` }, 4000);

        this.statusContainer.appendChild(message)
    }

    checkRequest(event) {
        event.preventDefault();

        if (this.nameInput.value == '') {
            this.checkInput('user')
            return
        }
        if (this.repositoryInput.value == '') {
            this.checkInput('repository')
            return
        }
        else {
            this.progressbar()
            this.addRepository()
        }
    }

    async addRepository() {
        try {
            let userInput = this.nameInput.value
            let repoInput = this.repositoryInput.value

            let response = await api.get(`/repos/${userInput}/${repoInput}`)
            let { name, description, owner: { avatar_url }, html_url, full_name } = response.data

            const find = this.repositories.find(item => {
                return item.full_name === full_name
            })

            if (find != undefined) {
                this.alertMessage('warning', 'Este repositório já está em sua lista')
            } else {
                this.repositories.push({
                    name,
                    description,
                    avatar_url,
                    html_url,
                    full_name
                })

                this.nameInput.value = ''
                this.repositoryInput.value = ''

                this.getRepoList()
                this.saveToStorage()

            }
        } catch (err) {
            if (err.response.status === 404) {
                this.alertMessage('danger', 'Repositório não encontrado')
            }
            else {
                this.alertMessage('danger', 'Erro ao adicionar repositório')
            }
        }
        this.progressbar(false)
    }

    saveToStorage() {
        localStorage.setItem('repo_list', JSON.stringify(this.repositories))
    }
}

new App()