define([ './apiCalls.js', './statesManager.js'], function ( apiCalls, statesManager) {
    const { createLicence } = apiCalls
    const { widgetId, accountId, widgetInfo, licenceStatus, widgetSettings } = statesManager

    function renderContentInSettings(template) {
        const contentWrapper = document.querySelector('.widget-content-wrapper')
        contentWrapper.innerHTML = template
    }

	function renderPaymentBlock(template) {
		const paymentWrapper = document.querySelector('.payment')
		paymentWrapper.innerHTML = template
	}



    function renderCommentOfferModal(message) {

        const commentOfferBtn = document.querySelector('.comment-offer')
        async function onCommentOfferBtnClick() {
            document.querySelector('.modal-scroller').click()

            const widgetBlock = document.querySelector(`#${widgetSettings().widget_code}`)
            widgetBlock.click()
            await new Promise((resolve) => setTimeout(() => resolve(), 1000))
            const commentBtn = document.querySelector('.widget-additional-info__add-review')
            console.log(commentBtn)
            if (commentBtn) {
                commentBtn.click()

                const widgetInfoBlock = document.querySelector('.widget-settings__additional-block')
                const observer = new MutationObserver(giveLicence)
                async function giveLicence() {
                    if (widgetInfoBlock.querySelector('.widget-additional-info__edit-review')) {
                        const endDateOfTestLicence = new Date(licenceStatus().data.date_end).getTime()
                        const endDateOfNewLicence = new Date(endDateOfTestLicence + 1000 * 60 * 60 * 24 * 14)
                        const licenceInfo = await createLicence(widgetId(), accountId(), true, endDateOfNewLicence)
                        licenceStatus({
                            exist: true,
                            expired: false,
                            data: licenceInfo.data,
                        })
                        renderContentInSettings(
                            `<div style="color: green">Ваша лицензия действительна до ${formatDate(
                                new Date(licenceStatus().data.date_end)
                            )}</div>` + '<div class="payment"></div>'
                        )
                    }
                    observer.disconnect()
                }

                observer.observe(widgetInfoBlock, { childList: true })
            }

            commentOfferBtn.removeEventListener('click', onCommentOfferBtnClick)
        }
        commentOfferBtn.addEventListener('click', onCommentOfferBtnClick)

        localStorage.setItem(`welbex_widget:${widgetId()}:firstCommentOffer`, 'true')
    }

    return { renderContentInSettings, renderModal, renderPaymentBlock, renderCommentOfferModal }
})
