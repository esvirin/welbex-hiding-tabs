define(['./apiCalls.js', './statesManager.js', './renders.js'], function (
	apiCalls,
	statesManager,
	renders
) {
	const {
		createAccount,
		createLicence,
		createInstallation,
		createLicenceLead,
		getAccount,
		getLicence,
		getWidget,
		createWidget,
		getTariffs,
		getPaymentUrl,
		getInstallation
	} = apiCalls
	const { renderModal } = renders

	const { widgetId, accountId, licenceStatus, firstInit, installationInfo, widgetInfo } =
		statesManager

	async function updateInstallationInfo(client_id, phoneNumber, name) {
		let installation = await getInstallation(accountId(), widgetId())
		if (!installation.data) {
			const data = widgetInfo()

			const info = {
				account_id: accountId(),
				widget_id: widgetId(),
				domain: AMOCRM.constant('account').subdomain,
				phone: phoneNumber,
				client_id: client_id,
				client_secret: data.secret,
				auth_code: data.auth_code
			}
			if (name) {
				info.name = name
			}

			const createdInstallation = await createInstallation(info)
			installationInfo(createdInstallation.data)
			const licenceInfo = {
				number: phoneNumber,
				widget_name: data.name,
				tariff: AMOCRM.constant('account').tariffName,
				licence_end_date: AMOCRM.constant('account').paid_till,
				last_extended: AMOCRM.constant('account').paid_from,
				client_id
			}
			if (name) licenceInfo.contact_name = name
			createLicenceLead(AMOCRM.constant('account').subdomain, licenceInfo)
		} else {
			installationInfo(installation.data)
		}
	}

	async function updateWidgetId(amoWidgetId) {
		let widget = await getWidget(amoWidgetId)
		if (!widget) {
			renderModal('<h1 style="color: red">Ошибка</h1>')
			return null
		}

		if (!widget.data) {
			widget = await createWidget(amoWidgetId, widgetInfo().name, widgetInfo().description)

			if (!widget) {
				renderModal('<h1 style="color: red">Ошибка</h1>')
				return null
			}
		}
		widgetId((widget.data[0] || widget.data).id)
	}

	async function updateAccountId() {
		const amoId = AMOCRM.constant('account').id
		let account = await getAccount(amoId)

		if (!account) {
			renderModal('<h1 style="color: red">Ошибка</h1>')
			return true
		}
		if (!account.data) {
			const domain = AMOCRM.constant('account').subdomain

			account = await createAccount(amoId, domain)

			if (!account) {
				renderModal('<h1 style="color: red">Ошибка</h1>')
				return true
			}
		}
		accountId((account.data[0] || account.data).id)
	}
	async function updateLicenceStatus() {
		const licenseInfo = await getLicence(widgetId(), accountId())

		if (licenseInfo.data) {
			licenceStatus({ exist: true, expired: false, data: licenseInfo.data })
		} else if (licenseInfo.msg && licenseInfo.msg.includes('expired')) {
			licenceStatus({ exist: false, expired: true, data: null })
		} else {
			licenceStatus({ exist: false, expired: false, data: null })
		}
	}

	async function updateFirstInit() {
		firstInit(false)
	}
	return {
		updateAccountId,
		updateWidgetId,
		updateLicenceStatus,
		updateFirstInit,
		updateInstallationInfo
	}
})
