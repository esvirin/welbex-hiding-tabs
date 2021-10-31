define(['./constants.js'], function (constants) {
  const { ROOT_URL, TEMP_DEV_URL, HIDE_TABS_URL } = constants

  async function getPayment(invId) {
    try {
      return await (await fetch(`${ROOT_URL}/payment?inv_id=${invId}`)).json()
    } catch {
      return null
    }
  }
  async function getPaymentUrl(tariffId, widgetId, accountId) {
    try {
      return await (
        await fetch(
          `${ROOT_URL}/robokassa/payment-url?tariff_id=${tariffId}&account_id=${accountId}&widget_id=${widgetId}`
        )
      ).json()
    } catch {
      return null
    }
  }
  async function getPipelines() {
    try {
      return await (await fetch(`${TEMP_DEV_URL}/leads/pipelines`)).json()
    } catch {
      return null
    }
  }
  async function getTabs() {
    try {
      return await (
        await fetch(`${TEMP_DEV_URL}/leads/custom_fields/groups`)
      ).json()
    } catch {
      return null
    }
  }
  async function getWidget(amo_widget_id) {
    try {
      return await (
        await fetch(`${ROOT_URL}/registerWidget?amo_id=${amo_widget_id}`)
      ).json()
    } catch {
      return null
    }
  }

  async function getAccount(amo_id) {
    try {
      return await (
        await fetch(`${ROOT_URL}/registerAccount?amo_id=${amo_id}`)
      ).json()
    } catch {
      return null
    }
  }

  async function getLicence(widgetId, accountId) {
    try {
      return await (
        await fetch(`${ROOT_URL}/licence/${widgetId}/${accountId}`)
      ).json()
    } catch {
      return null
    }
  }

  async function getWidgetInfo(client_id) {
    try {
      return (
        await fetch(
          `https://${
            AMOCRM.constant('account').subdomain
          }.amocrm.ru/v3/clients/${client_id}`
        )
      ).json()
    } catch {
      return null
    }
  }

  async function getTariffs(widget_id) {
    try {
      return await (
        await fetch(`${ROOT_URL}/tariff/widget/${widget_id}`)
      ).json()
    } catch {
      return null
    }
  }

  async function getInstallation(widgetId, accountId) {
    try {
      return await (
        await fetch(`${ROOT_URL}/installation/${widgetId}/${accountId}`)
      ).json()
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

  async function createAccount(amo_id, domain) {
    try {
      return await (
        await fetch(`${ROOT_URL}/registerAccount`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amo_id, domain }),
        })
      ).json()
    } catch {
      return null
    }
  }

  async function createWidget(
    amo_widget_id,
    name = 'Название виджета',
    description = 'Описание'
  ) {
    try {
      return await (
        await fetch(`${ROOT_URL}/registerWidget`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amo_id: amo_widget_id,
            name,
            description,
          }),
        })
      ).json()
    } catch {
      return null
    }
  }

  async function createLicence(widgetId, accountId, test) {
    try {
      return await (
        await fetch(`${ROOT_URL}/licence`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widget_id: widgetId,
            account_id: accountId,
            test,
          }),
        })
      ).json()
    } catch {
      return null
    }
  }

  async function createLicenceLead(domain, info) {
    try {
      return await (
        await fetch(`${ROOT_URL}/amo/${domain}/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(info),
        })
      ).json()
    } catch {
      return null
    }
  }

  async function updateInstallation(installationId, body) {
    try {
      return await await fetch(`${ROOT_URL}/installation/${installationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } catch {
      return null
    }
  }

  async function getUsers() {
    try {
      const response = await fetch(`${TEMP_DEV_URL}/users?limit=20`)
      console.log('getUsers', response)
      return response
    } catch {
      return null
    }
  }

  async function getSettings(account_id) {
    try {
      return await fetch(`${HIDE_TABS_URL}/settings`)
    } catch {
      return null
    }
  }

  async function saveSettings(object) {
    try {
      return await fetch(`${HIDE_TABS_URL}/settings`, {
        method: 'PUT',
        headers: {
          Allow: 'PUT',
          Accept: 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,PUT,POST,PATCH,DELETE',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          ...object,
        }),
      })
    } catch {
      return null
    }
  }

  return {
    createAccount,
    createLicence,
    createWidget,
    createInstallation,
    createLicenceLead,
    getAccount,
    getLicence,
    getPipelines,
    getTabs,
    getWidget,
    getTariffs,
    getPaymentUrl,
    getPayment,
    getWidgetInfo,
    getInstallation,
    updateInstallation,
    getUsers,
    getSettings,
    saveSettings,
  }
})
