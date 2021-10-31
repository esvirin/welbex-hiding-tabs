define(['./constants.js'], function (constants) {
  const { ASANA_ROOT_URL } = constants

  //Для проверки токена
  async function getUser(apiToken) {
    try {
      // GET /tasks/{task_gid}/stories
      // from https://app.asana.com/0/1200815896328657/1200875292900515 (last)
      const data = await fetch(`${ASANA_ROOT_URL}/1.0/users/me`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
      })
      const res = await data.json()
      return res
    } catch (err) {
      return null
    }
  }

  //Получить истории (комментарии) задачи
  async function getTaskStories(apiToken, taskId) {
    try {
      // GET /tasks/{task_gid}/stories
      // from https://app.asana.com/0/1200815896328657/1200875292900515 (last)
      const data = await fetch(
        `${ASANA_ROOT_URL}/1.0/tasks/${taskId}/stories`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
        }
      )
      const res = await data.json()
      return res
    } catch (err) {
      return null
    }
  }

  //Отправить комментарий к задаче
  async function setTaskStories(apiToken, taskId, comment) {
    try {
      // GET /tasks/{task_gid}/stories
      // from https://app.asana.com/0/1200815896328657/1200875292900515 (last)
      const data = await fetch(
        `${ASANA_ROOT_URL}/1.0/tasks/${taskId}/stories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify(comment),
        }
      )
      const res = await data.json()
      return res
    } catch (err) {
      return null
    }
  }

  // Получить события на ресурсе
  async function getEvents(accountDomain, projectOrTaskId) {
    try {
      // GET https://app.asana.com/api/1.0/events?resource=12345 - проект 1200809188519065  или задача
      const data = await fetch(
        `${ASANA_ROOT_URL}/1.0/events?resource=1200949118270985&sync=c2ddbe04a7e3b2a6704a3177275825df:0`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
        }
      )
      const res = await data.json()
      return res
    } catch (err) {
      return null
    }
  }

  // пост https://app.asana.com/api/1.0/tasks

  //   {
  //   "data": {
  //     "assignee": "a.levina@e-wx.ru",
  //     "assignee_status": "upcoming",
  //     "completed": false,
  //     "followers": [
  //       "admin@welbex.ru"
  //     ],
  //     "html_notes": "<body> описание??html_notes.</body>",
  //     "name": "Задача, созданная из постмэна",
  //     "notes": "описание??html_notes.",

  //     "resource_subtype": "default_task",
  //     "workspace": "1130275506300375"
  //   }
  // }

  async function getPayment(invId) {
    try {
      return await (await fetch(`${ROOT_URL}/payment?inv_id=${invId}`)).json()
    } catch {
      return null
    }
  }

  async function createInstallation(info) {
    try {
      return await (
        await fetch(`${ROOT_URL}/installation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(info),
        })
      ).json()
    } catch {
      return null
    }
  }

  return {
    getUser,
    getTaskStories,
    getEvents,
    setTaskStories,
  }
})
