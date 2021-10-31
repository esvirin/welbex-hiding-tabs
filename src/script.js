define([
    'jquery',
    './apiCalls.js',
    './templates.js',
    './constants.js',
    './utils.js',
    './statesManager.js',
    './statesUpdaters.js',
    './renders.js',
    './Components.js',
    './asanaApi.js',
], function (
    $,
    apiCalls,
    templates,
    constants,
    utils,
    statesManager,
    statesUpdaters,
    renders,
    Components,
    asanaApi
) {
    var CustomWidget = function () {
        const self = this

        const {
            createLicence,
            createInstallation,
            getTariffs,
            getPaymentUrl,
            getPayment,
            updateInstallation,
            createLicenceLead,
            getLicence,
            getPipelines: getPipelinesApi,
            getTabs: getTabsApi,
            saveSettings: saveSettingsApi,
            getSettings: getSettingsApi,
            getUsers: getUsersApi,
            getWidgetInfo,
        } = apiCalls
        const {
            buyingLicenceTemplate,
            loaderTemplate,
            asanaTemplateForm,
            asanaCommentTaskTemplate,
            buyingLicenceTemplateSettingPage,
        } = templates
        const {
            widgetId,
            accountId,
            licenceStatus,
            firstInit,
            installationInfo,
            widgetInfo,
        } = statesManager
        const {
            updateAccountId,
            updateWidgetId,
            updateLicenceStatus,
            updateInstallationInfo,
        } = statesUpdaters
        const {formatDate, isPhone} = utils
        const {renderContentInSettings, renderModal, renderPaymentBlock} = renders
        const account = AMOCRM.constant('account')

        let finishWidgetInit

        const tableClass = 'tabs-table'
        const rowClass = 'tabs-table__row'
        const classes = {table: tableClass, row: rowClass}

        const checkBoxInputClass = 'js-item-checkbox'
        const checkBoxMasterClass = 'js-master-checkbox'
        const checkBoxPipelinesClass = 'welbex__dropdown-checkboxes-pipelines'
        const checkBoxTabsClass = 'welbex__dropdown-checkboxes-tabs'
        const pipelinesListId = 'welbex__pipelines-list'
        const tabsListId = 'welbex__tabs-list'

        let users = {}
        let settings = []
        let rows = {}
        let tabs = []
        self.firstInit = async function () {
            if (firstInit()) {
                const settings = self.get_settings()
                rows = await getSettings()
                hideTabs()

                widgetInfo(await getWidgetInfo(settings.oauth_client_uuid))

                await updateWidgetId(self.params.widget_code)
                await updateAccountId()
                await updateLicenceStatus()

                await updateInstallationInfo(
                    settings.oauth_client_uuid,
                    settings.phone_number,
                    settings.name
                )
            }
        }

        async function getPipelines() {
            const response = await getPipelinesApi()
            const {pipelines} = response?._embedded
            if (!pipelines || !(pipelines instanceof Array)) {
                return []
            }
            const result = pipelines.map((pipeline, index) => ({
                id: `${pipeline.id}`,
                option: pipeline.name,
            }))

            return result
        }

        async function getTabs() {
            const response = await getTabsApi()
            const tabs = response?._embedded?.custom_field_groups
            if (!tabs || !(tabs instanceof Array)) {
                return []
            }

            const result = tabs.map((tab, index) => ({
                id: `${tab.id}`,
                option: tab.name,
            }))

            return result
        }

        const renderPipelinesMultiSelect = async function () {
            let settings = {
                items: await getPipelines(),
                class_name: 'welbex__dropdown-checkboxes ' + checkBoxPipelinesClass,
                id: 'welbex__pipelines-list',
            }
            return self.render(
                {ref: '/tmpl/controls/checkboxes_dropdown.twig'},
                settings
            )
        }

        const renderTabsMultiSelect = function (pipeline) {
            const checkedTabs = rows[pipeline]?.map((tab) => tab.tab) ?? []
            const items = tabs.map((tab) => {
                if (checkedTabs.includes(tab.id)) {
                    return {...tab, is_checked: true}
                }
                return tab
            })
            let settings = {
                items,
                class_name: 'welbex__dropdown-checkboxes ' + checkBoxTabsClass,
                id: 'welbex__tabs-list',
                checked: 1,
            }
            return self.render(
                {ref: '/tmpl/controls/checkboxes_dropdown.twig'},
                settings
            )
        }

        const advancedSettingsPagesContent = {
            main: async function () {
                const pipelines = await getPipelines()

                return `<div class="hidetabs">${Components.SettingsBlockWithCaption(
                    Components.CreateTabTable(
                        pipelines,
                        renderTabsMultiSelect,
                        Components.DeleteButtonIcon('tabs-table__delete-button'),
                        classes
                    ),
                    'settings-block__responsible'
                )}</div>`
            },
            instruction: async function () {
                return Components.SettingsBlockWrapper(
                    '<h3 style="margin-bottom: 20px">instruction page</h3>'
                )
            },
            settings: async function () {
                const pipelines = await getPipelines()

                return `<div class="hidetabs">${Components.SettingsBlockWithCaption(
                    Components.CreateTabTable(
                        pipelines,
                        renderTabsMultiSelect,
                        Components.DeleteButtonIcon('tabs-table__delete-button'),
                        classes
                    ),
                    'settings-block__responsible'
                )}</div>`
            },
            payment: async function (selectedTariffId) {
                const tariffs = await getTariffs(widgetId())
                if (!tariffs) {
                    renderModal('<h1 style="color: red">Ошибка</h1>')
                    return
                }
                const hasSelectOption = tariffs.data.find(
                    (tariff) => tariff.selected_by_default
                )
                let currentTariffId = hasSelectOption
                    ? hasSelectOption.id
                    : tariffs.data[0].id
                currentTariffId = selectedTariffId ? selectedTariffId : currentTariffId
                const isLicenceExpired = licenceStatus().expired
                const subscriptionDate = licenceStatus().data
                    ? formatDate(new Date(licenceStatus().data.date_end))
                    : getLicence(widgetId(), accountId())
                return buyingLicenceTemplateSettingPage(
                    tariffs.data,
                    currentTariffId,
                    licenceStatus().data,
                    subscriptionDate,
                    isLicenceExpired
                )
            },
            help: async function () {
                return Components.SettingsBlockWrapper('<h1>Помощь</h1>')
            },
            users: async function () {
                return Components.SettingsBlockWrapper('<h1>Пользователи</h1>')
            },
        }

        self.loadAdvancedSettings = async function () {
            const AdvancedSettingsRoot = $('#list_page_holder')
            let table = Components.AnimationNavUnderlining()
            table += `
				<div class="welbex_ad_settings">
					${Components.MainSettingsCaption('Скрытие вкладок')}
					<div class="welbex_ad_settings__menu">
          ${Components.MenuNavigationList(
                Components.MenuButtonMain(true, 'main'),
                Components.MenuButtonPayment(false),
                Components.MenuButtonHelp(false, 'help'),
                Components.MenuButtonUsers(false, 'users')
            )}
					</div>
					<div class="welbex_ad_settings__submenu welbex_ad_settings__submenu-wrapper">
							${Components.SubmenuNavigationList(
                Components.SubmenuButton('settings', 'Настройки'),
                Components.SubmenuButton('instruction', 'Инструкция')
            )}
					</div>`

            table += `<div class="welbex_ad_settings__body"></div>`
            table += `</div>`
            AdvancedSettingsRoot.html(table)

            const navButtonsListRef = document.querySelectorAll(
                '.welbex_ad_settings__nav'
            )
            // Добавляем контейнеры для страниц
            document
                .querySelector('.welbex_ad_settings__body')
                .insertAdjacentHTML(
                    'beforeend',
                    [...navButtonsListRef]
                        .map(
                            ({dataset: {nav, withsubmenu}}) =>
                                `<div class="welbex_ad_settings__page" data-page="${nav}" data-withsubnav="${withsubmenu}"></div>`
                        )
                        .join('') + Components.PaymentPageContainer()
                )
            const firstPageContainer = document.querySelector(
                '.welbex_ad_settings__page'
            )
            const firstPageName = document.querySelector('.welbex_ad_settings__nav')
                .dataset.nav
            firstPageContainer.innerHTML = await advancedSettingsPagesContent[
                firstPageName
                ]()

            //добавляем декоративный underline
            document
                .querySelector('.welbex_ad_settings__menu-btn')
                .classList.add('--active')
            document
                .querySelector('.welbex_ad_settings__submenu-btn')
                .classList.add('--active')
            firstPageContainer.classList.add('--active')
            document
                .querySelector('.welbex_ad_settings__page[data-withsubnav="true"]')
                .classList.add('--active')
        }

        self.onBuyBtnClick = async function (e, selectedTariffId) {
            const buyBtn = document.querySelector('.payment__buy-btn')
            const buyBtnSettingsPage = document.querySelector(
                '.welbex-settings__payment-page__payment__buy-btn.payment__buy-btn'
            )
            const tariffs = await getTariffs(widgetId())
            if (!tariffs) {
                renderModal('<h1 style="color: red">Ошибка</h1>')
                return
            }
            const hasSelectOption = tariffs.data.find(
                (tariff) => tariff.selected_by_default
            )
            let currentTariff = hasSelectOption
                ? hasSelectOption.id
                : tariffs.data[0].id
            currentTariff = selectedTariffId ? selectedTariffId : currentTariff
            e.target.style.display = 'none'
            e.target.insertAdjacentHTML('afterend', loaderTemplate())
            const paymentData = await getPaymentUrl(
                tariffs.data.find((tariff) => tariff.id == currentTariff).id,
                widgetId(),
                accountId()
            )
            const invId = paymentData.data.invId
            const tempLink = document.createElement('a')
            tempLink.href = paymentData.data.url
            tempLink.target = '_blank'
            tempLink.click()
            tempLink.remove()
            e.target.style.display = 'flex'
            e.target.nextElementSibling.style.display = 'none'
            buyBtnSettingsPage.addEventListener('click', (e) =>
                self.onBuyBtnClick(e, currentTariff)
            )
            buyBtn.addEventListener('click', (e) =>
                self.onBuyBtnClick(e, currentTariff)
            )
            setTimeout(() => {
                const updatingLicenceStatus = setInterval(async () => {
                    const payment = await getPayment(invId)
                    const paymentStatus = payment.data[0].status
                    if (paymentStatus === 'Completed') {
                        saveBtn.querySelector('span').innerText = 'Сохранить'
                        renderModal(
                            '<h1 style="color: green">Оплата прошла успешно. Лицензия выдана</h1>'
                        )
                        await updateLicenceStatus()
                        renderContentInSettings(
                            `<div style="color: green">Ваша лицензия действительна до ${formatDate(
                                new Date(licenceStatus().data.date_end)
                            )}</div>`
                        )
                        clearInterval(updatingLicenceStatus)
                    } else if (paymentStatus === 'Failed') {
                        buyBtn.style.display = 'block'
                        renderModal('<h1 style="color: red">Ошибка оплаты</h1>')
                        clearInterval(updatingLicenceStatus)
                        buyBtnSettingsPage.addEventListener('click', (e) =>
                            self.onBuyBtnClick(e, currentTariff)
                        )
                        buyBtn.addEventListener('click', (e) =>
                            self.onBuyBtnClick(e, currentTariff)
                        )
                    }
                }, 5000)
            }, 15000)
        }

        self.underlineCurrentSettingPage = function () {
            //анимация - подчеркивание текущей страницы
            //главное меню
            const menuButton = document.querySelector(
                '.welbex_ad_settings__menu-btn.--active'
            )
            const underlineCurrentMenuPage = document.querySelector(
                '.welbex_ad_settings__menu-nav--underline'
            )
            const {x: menuButtonXPosition, width: menuButtonWidth} =
                menuButton.getBoundingClientRect()
            const {width: leftMenuWidth} = document
                .getElementById('left_menu')
                .getBoundingClientRect()
            const {x: sidebarX, width: sidebarWidth} = document
                .getElementById('sidebar')
                .getBoundingClientRect()
            const sidebarWidthIfHidden = sidebarX > 0 ? sidebarWidth : 0
            underlineCurrentMenuPage.style.left =
                menuButtonXPosition - leftMenuWidth - sidebarWidthIfHidden + 'px'
            underlineCurrentMenuPage.style.width = menuButtonWidth + 'px'
            //подменю
            const subMenuButton = document.querySelector(
                '.welbex_ad_settings__submenu-btn.--active'
            )
            if (subMenuButton) {
                const underlineCurrentSubMenuPage = document.querySelector(
                    '.welbex_ad_settings__submenu-nav--underline'
                )
                const {x: subMenuButtonXPosition, width: subMenuButtonWidth} =
                    subMenuButton.getBoundingClientRect()
                underlineCurrentSubMenuPage.style.left =
                    subMenuButtonXPosition - leftMenuWidth - sidebarWidthIfHidden + 'px'
                underlineCurrentSubMenuPage.style.width = subMenuButtonWidth + 'px'
            }
        }

        self.getDataForPaymentItemFramePosition = function () {
            const {x: currentItemXPosition} = document
                .querySelector(
                    '.welbex-settings__payment-page__payment__tariffs__item--current'
                )
                .getBoundingClientRect()
            const {width: leftMenuWidth} = document
                .getElementById('left_menu')
                .getBoundingClientRect()
            const {x: sidebarX, width: sidebarWidth} = document
                .getElementById('sidebar')
                .getBoundingClientRect()
            const sidebarWidthIfHidden = sidebarX > 0 ? sidebarWidth : 0
            return {currentItemXPosition, leftMenuWidth, sidebarWidthIfHidden}
        }

        function hideTabs() {
            const pipelineId = document.querySelector(
                'input.pipeline-select__pipeline-selected'
            )?.value

            const cardTabs = document.querySelector("#card_tabs")
            const tabs = document.querySelectorAll('.card-tabs-wrapper  .js-card-tab')
            const tabsFromMenuList = document.querySelectorAll(".card-tabs__item_in-context")
            rows[pipelineId]?.forEach((selectedTab) => { // selectedTab === {"id":1185,"tab":"leads_75991626261780"}

                tabs.forEach((tab) => {

                    if (
                        tab.id.includes(selectedTab.tab) ||
                        tab.dataset?.id?.includes(selectedTab.tab)
                    ) {
                        if (selectedTab.tab === 'default') {
                            const mainFields = document.querySelector('.js-card-main-fields')
                            const mainWrapper = document.querySelector(
                                '.linked-forms__group-wrapper.linked-forms__group-wrapper_main.js-cf-group-wrapper[data-id=default]'
                            )
                            const linkedBlock = document.querySelector(
                                '.js-linked_contacts_and_companies'
                            )
                            if (mainFields) {
                                mainFields.innerHTML = ''
                            }
                            if (mainWrapper) {
                                mainWrapper.innerHTML = ''
                            }
                            if (linkedBlock) {
                                linkedBlock.style.display = 'none'
                            }
                        }
                        tab.outerHTML = ''
                    }
                })
            })

            tabs.forEach(tab => {
                if (tab.getAttribute("data-alien")) {
                    tab.remove()
                }
            })

            tabsFromMenuList.forEach(elementFromMenuList => {
                const newElement = elementFromMenuList.firstChild.cloneNode(true)
                newElement.className = "card-tabs__item js-card-tab"
                newElement.dataset.id = elementFromMenuList.id.slice(15)
                newElement.dataset.alien = "true"
                newElement.firstChild.className = "card-tabs__item-inner"
                newElement.addEventListener("click", e => {
                    document.location.search = "?tab_id=" + e.target.parentNode.dataset.id
                })
                cardTabs.appendChild(newElement)
            })
        }


        async function getSettings() {
            const response = await getSettingsApi()
            const data = await response.json()
            rows = data
            return rows
        }

        async function saveSettings(object) {
            const response = await saveSettingsApi(object)
        }

        this.callbacks = {
            settings: async function () {
                await updateLicenceStatus()
                const settingsArea = document.querySelector(
                    '.widget_settings_block__fields'
                )
                settingsArea.insertAdjacentHTML(
                    'afterbegin',
                    '<div class="widget-content-wrapper"></div>'
                )

                if (licenceStatus().exist) {
                    renderContentInSettings(
                        `<div style="color: green">Ваша лицензия действительна до ${formatDate(
                            new Date(licenceStatus().data.date_end)
                        )}</div>`
                    )
                } else {
                    if (licenceStatus().expired) {
                        renderContentInSettings(
                            '<div style="color: red">Ваша лицензия истекла</div>' +
                            '<div class="payment"></div>'
                        )
                    }
                    // else {
                    //   renderContentInSettings(
                    //     '<div style="color: red">Для использования виджета приобретите или получите тестовую лицензию</div>' +
                    //       '<div class="payment"></div>'
                    //   )
                    // }
                    const tariffs = await getTariffs(widgetId())

                    if (!tariffs) {
                        renderModal('<h1 style="color: red">Ошибка</h1>')
                        return
                    }

                    const hasSelectOption = tariffs.data.find(
                        (tariff) => tariff.selected_by_default
                    )
                    let currentTariff = hasSelectOption
                        ? hasSelectOption.id
                        : tariffs.data[0].id
                    renderPaymentBlock(buyingLicenceTemplate(tariffs.data, currentTariff))
                    const paymentWrapper = document.querySelector('.payment')
                    paymentWrapper.insertAdjacentHTML(
                        'afterend',
                        `<div class="payment__tariffs__current"></div>`
                    )
                    const buyBtn = document.querySelector('.payment__buy-btn')

                    buyBtn.addEventListener('click', (e) =>
                        self.onBuyBtnClick(e, currentTariff)
                    )

                    paymentWrapper.addEventListener('click', (e) => {
                        const item = e.target.closest('.payment__tariffs__item')
                        if (item) {
                            currentTariff = item.getAttribute('data-id')
                            const currentItemFrame = document.querySelector(
                                '.payment__tariffs__current'
                            )
                            const items = document.querySelectorAll('.payment__tariffs__item')
                            currentItemFrame.style.transform = `translate(${
                                [...items].indexOf(item) * 156
                            }px)`
                            renderPaymentBlock(
                                buyingLicenceTemplate(tariffs.data, currentTariff)
                            )

                            const buyBtn = document.querySelector('.payment__buy-btn')
                            buyBtn.addEventListener('click', (e) =>
                                self.onBuyBtnClick(e, currentTariff)
                            )
                        }
                    })
                }
                return true
            },
            init: async function () {
                await self.firstInit()
                const head = document.querySelector('head')
                const settings = self.get_settings()
                head.insertAdjacentHTML(
                    'beforeend',
                    `<link href="${settings.path}/index.css?v=${settings.version} type="text/css" rel="stylesheet">`
                )
                if (licenceStatus().exist) {
                }
                return true
            },
            bind_actions: async function () {
                await self.firstInit()
                const tabs = await getTabs()

                //навигация
                document.addEventListener('click', async function (e) {
                    const paymentPageCurrentItemFrame = document.querySelector(
                        '.welbex_ad_settings__payment-tariffs-current-frame'
                    )
                    if (e.target.dataset.nav || e.target.parentNode.dataset.nav) {
                        const btn = e.target
                        const btnIfClickInInner = e.target.parentNode
                        const targetNavBtn =
                            e.target.nodeName === 'BUTTON' ? btn : btnIfClickInInner
                        const pageName =
                            e.target.dataset.nav || e.target.parentNode.dataset.nav
                        const underlineCurrentSubMenuPage = document.querySelector(
                            '.welbex_ad_settings__submenu-nav--underline'
                        )
                        //если клик в ту же кнопку
                        if (targetNavBtn.classList.contains('--active')) {
                            return
                        }
                        //если переходим со страницы оплаты - удаление рамки-анимации
                        paymentPageCurrentItemFrame.style.display = 'none'
                        //меняем содержание страниц
                        document.querySelector(
                            '.welbex_ad_settings__page.--active'
                        ).innerHTML = ''
                        document
                            .querySelector('.welbex_ad_settings__page.--active')
                            .classList.remove('--active')
                        const pageContainer = document.querySelector(
                            `[data-page="${pageName}"]`
                        )
                        pageContainer.innerHTML = await advancedSettingsPagesContent[
                            pageName
                            ]()
                        pageContainer.classList.add('--active')
                        //меняем положение декоративного underline
                        if (targetNavBtn.dataset.withsubmenu) {
                            document
                                .querySelector('.welbex_ad_settings__menu-btn.--active')
                                .classList.remove('--active')
                        } else {
                            document
                                .querySelector('.welbex_ad_settings__submenu-btn.--active')
                                .classList.remove('--active')
                        }
                        targetNavBtn.classList.add('--active')
                        //если на странице нету подменю
                        if (targetNavBtn.dataset.withsubmenu === 'false') {
                            underlineCurrentSubMenuPage.style.display = 'none'
                            document.querySelector(
                                '.welbex_ad_settings__submenu-wrapper'
                            ).style.display = 'none'
                            document
                                .querySelector('.welbex_ad_settings__submenu-btn.--active')
                                .classList.remove('--active')
                            document
                                .querySelector('.welbex_ad_settings__submenu-btn')
                                .classList.add('--active')
                        } else {
                            underlineCurrentSubMenuPage.style.display = 'block'
                            document.querySelector(
                                '.welbex_ad_settings__submenu-wrapper'
                            ).style.display = 'block'
                        }
                        self.underlineCurrentSettingPage()
                        //если переходим на страницу оплаты
                        if (targetNavBtn.dataset.nav === 'payment') {
                            const buyBtn = document.querySelector(
                                '.welbex-settings__payment-page__payment__buy-btn.payment__buy-btn'
                            )
                            buyBtn.addEventListener('click', self.onBuyBtnClick)
                            paymentPageCurrentItemFrame.style.display = 'block'
                            //позиционирование рамки - возвращаем в исходное положение
                            const {
                                currentItemXPosition,
                                leftMenuWidth,
                                sidebarWidthIfHidden,
                            } = self.getDataForPaymentItemFramePosition()
                            paymentPageCurrentItemFrame.style.transform = `translate(${
                                currentItemXPosition - 50 - leftMenuWidth - sidebarWidthIfHidden
                            }px)`
                        }
                    }
                })

                //страница оплаты
                document.addEventListener('click', async function (e) {
                    const paymentPageCurrentItemFrame = document.querySelector(
                        '.welbex_ad_settings__payment-tariffs-current-frame'
                    )
                    const pageContainer = document.querySelector(`[data-page="payment"]`)
                    const item = e.target.closest(
                        '.welbex-settings__payment-page__payment__tariffs__item'
                    )
                    if (item) {
                        const currentTariffId = item.getAttribute('data-id')
                        pageContainer.innerHTML =
                            await advancedSettingsPagesContent.payment(currentTariffId)
                        // позиционирование рамки
                        const {
                            currentItemXPosition,
                            leftMenuWidth,
                            sidebarWidthIfHidden,
                        } = self.getDataForPaymentItemFramePosition()
                        paymentPageCurrentItemFrame.style.transform = `translate(${
                            currentItemXPosition - 50 - leftMenuWidth - sidebarWidthIfHidden
                        }px)`
                        const buyBtn = document.querySelector(
                            '.welbex-settings__payment-page__payment__buy-btn.payment__buy-btn'
                        )
                        buyBtn.addEventListener('click', (e) =>
                            self.onBuyBtnClick(e, currentTariffId)
                        )
                    }
                })

                //обработчики клик и onchange на какой-либо странице,
                /* { изменение опций настроек пользователем, сохранение изменений на сервер, обновление интерфейса после внесенных изменений:
                                 const currentPageContainer = document.querySelector('.welbex_ad_settings__page.--active')
                                 const currentPageName = pageContainer.dataset.page
                                 pageContainer.innerHTML = await advancedSettingsPagesContent[currentPageName]()
                                 } */
                document.addEventListener('click', (e) => {
                    if (
                        e.target.classList.contains('tabs-table__delete-button') ||
                        e.target.tagName === 'svg' ||
                        e.target.tagName === 'path'
                    ) {
                        if (e.target.tagName === 'svg') {
                            removeRow(e.target.parentNode)
                            return
                        } else if (e.target.tagName === 'path') {
                            removeRow(e.target.parentNode.parentNode)
                            return
                        }
                        removeRow(e.target)
                    }
                })

                document.addEventListener('change', async (e) => {
                    const target = e.target
                    const isRemoveSelection =
                        target.parentNode.nextElementSibling?.innerText !==
                        'Снять выделение'
                    const $row = target.closest('.' + rowClass)

                    if (target.classList.contains(checkBoxInputClass)) {
                        const itemId = target.dataset.value
                        const pipelineId = $row.dataset.pipelineId.toString().split(':')[0]
                        let pipelineTabs = rows[pipelineId]

                        const index =
                            pipelineTabs?.findIndex((tab) => tab.tab === itemId) ?? -1

                        if (index !== -1) {
                            pipelineTabs.splice(index, 1)
                            await saveSettings({
                                tab: itemId,
                                pipeline_id: pipelineId,
                                remove: true,
                            })
                        } else {
                            await saveSettings({
                                tab: itemId,
                                pipeline_id: pipelineId,
                                remove: false,
                            })
                            pipelineTabs.push({tab: itemId, pipeline_id: pipelineId})
                        }
                    }

                    if (target.classList.contains(checkBoxMasterClass)) {
                        const itemId = target.dataset.value
                        const pipelineId = $row.dataset.pipelineId
                        let pipelineTabs = rows[pipelineId]
                        const pipelineTabsCount = pipelineTabs?.length ?? 0

                        if (
                            (pipelineTabsCount <= tabs.length && pipelineTabsCount > 0) ||
                            (isRemoveSelection &&
                                target.parentNode.nextElementSibling !== null)
                        ) {
                            await saveSettings({
                                tabs: rows[pipelineId]?.map((tab) => tab.tab) ?? [],
                                pipeline_id: pipelineId,
                                remove: true,
                            })
                            rows[pipelineId] = []
                        } else {
                            rows[pipelineId] = tabs.map((checkbox) => ({
                                tab: checkbox.id,
                                pipeline_id: pipelineId,
                            }))
                            await saveSettings({
                                tabs: rows[pipelineId].map((tab) => tab.tab),
                                pipeline_id: pipelineId,
                                remove: false,
                            })
                        }
                    }
                })
            },
            render: async function () {
                rows = await getSettings()
                tabs = await getTabs()
                await self.firstInit()
                if (licenceStatus().exist) {
                }
                hideTabs()


                // document.querySelector("#card_holder > div.js-card-column-resizer.card-holder__column-resizer").addEventListener("mouseup", () => {
                //     setTimeout(hideTabs, 0)
                // })

                const targetNode = document.querySelector("#card_holder > div.js-card-column-resizer.card-holder__column-resizer")
                const observer = new MutationObserver(mutationsList => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === 'attributes' && mutation.attributeName === "class") {
                            setTimeout(hideTabs, 0)
                        }
                    }
                });
                observer.observe(targetNode, {attributes: true, childList: true, subtree: true});


            },

            dpSettings: function () {
            },
            advancedSettings: async function () {
                await self.firstInit()
                const tariffs = await getTariffs(widgetId())
                if (!tariffs) {
                    renderModal('<h1 style="color: red">Ошибка</h1>')
                    return
                }
                self.loadAdvancedSettings()
            },
            destroy: function () {
            },
            contacts: {
                selected: function () {
                },
            },
            onSalesbotDesignerSave: function (handler_code, params) {
            },
            leads: {
                selected: function () {
                },
            },
            todo: {
                selected: function () {
                },
            },
            onSave: async function ({fields, active}) {
                await self.firstInit()
                if (!isPhone(fields.phoneNumber)) {
                    renderModal('<h1 style="color: red">Неверный номер телефона</h1>')
                    return false
                }
                const isInstalling = self.params.widget_active === 'N'
                const isUninstalling = active === 'N'
                if (!licenceStatus().exist && isInstalling) {
                    const licenceInfo = await createLicence(widgetId(), accountId(), true)
                    if (licenceInfo.errors) {
                        renderModal(
                            '<h1 style="color: red">Ошибка получения тестовой лицензии</h1>'
                        )
                        return true
                    }

                    licenceStatus({exist: true, expired: false, data: licenceInfo.data})
                    renderContentInSettings(
                        `<div style="color: green">Ваша лицензия действительна до ${formatDate(
                            new Date(licenceStatus().data.date_end)
                        )}</div>`
                    )
                    renderModal(
                        '<h1 style="color: green">Вы успешно получили тестовую лицензию</h1>'
                    )
                }

                if (installationInfo()) {
                    const info = {}
                    if (fields.phoneNumber && installationInfo().phone != fields.phone)
                        info.phone = fields.phoneNumber
                    if (fields.name && installationInfo().name != fields.name)
                        info.name = fields.name

                    if (isInstalling) {
                        info.is_installed = true
                    }
                    if (Object.keys(info).length) {
                        await updateInstallation(installationInfo().id, info)
                    }
                }

                if (isUninstalling) {
                    await updateInstallation(installationInfo().id, {
                        is_installed: false,
                    })
                }
                return true
            },
            onAddAsSource: function (pipeline_id) {
            },
        }
        return this
    }
    return CustomWidget
})
