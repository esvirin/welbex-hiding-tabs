define(['./Components.js'], function (Components) {
	return {
		licenceIsExpiredTemplate: () => {
			return '<div class="licence-status" style="background-color: red">Лицензия истекла</div>'
		},
		getTestLicenceTemplate: () => {
			return '<div class="licence-status" style="background-color: green; cursor: pointer">Получить тестовую лицензию</button></div>'
		},
		buyingLicenceTemplate: (tariffs, currentTariffId) => {
			const formatDate = new Intl.DateTimeFormat('ru-RU').format
			const currentTariff = tariffs.find(tariff => parseInt(tariff.id) === parseInt(currentTariffId))
			return `
				<div class="payment__tariffs">
					${tariffs
						.map((tariff, index) => {
							return `
							<div id="payment__tariffs__item" data-index="${index}" class="payment__tariffs__item ${
								parseInt(tariff.id) === parseInt(currentTariffId) && 'payment__tariffs__item--current'
							}" data-id="${tariff.id}">
								<div class="payment__tariffs__item__title">${tariff.title}</div>
								<div class="payment__tariffs__item__description">${tariff.description}</div>
								<div class="payment__tariffs__item__price">${tariff.price}  &#x20bd;</div>
							</div>							
						`
						})
				.join('')}
						
				</div>
				<div class="payment__info">
					<div class="payment__info__date">До ${formatDate(
						new Date(Date.now() + currentTariff.duration * 1000)
					)}</div>
					<div class="payment__info__price">${currentTariff.price} руб.</div>
					<div class="payment__buy-btn">Оплатить онлайн</div>
				</div>
				
			` 
		},
		loaderTemplate: () => `
			<div class="gd-widget-body__loader-wrapper">
				<div id="amocrm-spinner" style="both:clear;">
					<span style="width: 20px;height: 20px;margin: 0 auto;display: block;position: static;" class="pipeline_leads__load_more__spinner spinner-icon spinner-icon-abs-center">
					</span>
				</div>
			</div>
				`,
		
		 buyingLicenceTemplate: (tariffs, currentTariffId) => {
			const formatDate = new Intl.DateTimeFormat('ru-RU').format
			const currentTariff = tariffs.find(tariff => tariff.id == currentTariffId)
			return `
				<div class="payment__tariffs">
					${tariffs
						.map((tariff, index) => {
							return `
							<div id="payment__tariffs__item" data-index="${index}" class="payment__tariffs__item ${
								tariff.id == currentTariffId && 'payment__tariffs__item--current'
							}" data-id="${tariff.id}">
								<div class="payment__tariffs__item__title">${tariff.title}</div>
								<div class="payment__tariffs__item__description">${tariff.description}</div>
								<div class="payment__tariffs__item__price">${tariff.price} &#x20bd;</div>
							</div>							
						`
						})
				.join('')}
						
				</div>
				<div class="payment__info">
					<div class="payment__info__date">До ${formatDate(
						new Date(Date.now() + currentTariff.duration * 1000)
					)}</div>
					<div class="payment__info__price">${currentTariff.price} руб.</div>
					<div class="payment__buy-btn">Оплатить онлайн</div>
				</div>
			` 
		},

		buyingLicenceTemplateSettingPage: (tariffs, currentTariffId, isLicenceTest, licenceLimitation, isLicenceExpired) => {
			const currentTariff = tariffs.find(tariff => tariff.id == currentTariffId)
			return `
			<div class="welbex-settings__payment-page"> 
					<p class="welbex-settings__payment__current-licence-duration"> ${isLicenceExpired ? `Ваша лицензия истекла ${licenceLimitation}. Требуется продлить для дальнейшего использования` : isLicenceTest ? `Ваша лицензия находится на тестовом периоде до ${licenceLimitation}` : `Ваша лицензия оплачена до ${licenceLimitation}` }</p> 
					<p class="welbex-settings__payment__choose-licence-duration">Выберите длительность лицензии</p> 
							<div class="select-payment-option-wrapper">
				<div class="welbex-settings__payment-page__payment__tariffs">
					${tariffs
						.map((tariff, index) => {
							return `
							<div data-index="${index}" class="welbex-settings__payment-page__payment__tariffs__item ${
								tariff.id == currentTariffId && 'welbex-settings__payment-page__payment__tariffs__item--current'
							}" data-id="${tariff.id}">
								<div class="welbex-settings__payment-page__payment__tariffs__item__title">${tariff.title}</div>
								<div class="welbex-settings__payment-page__payment__tariffs__item__description">${tariff.description}</div>
								<div class="welbex-settings__payment-page__payment__tariffs__item__price">${tariff.price} &#x20bd;</div>
							</div>							
						`
						})
				.join('')}
						
				</div>
				<div class="welbex-settings__payment-page__payment__info">
					<div class="welbex-settings__payment-page__payment__info__text">Сумма:</div>
					<div class="welbex-settings__payment-page__payment__info__price">${currentTariff.price} &#x20bd;</div>
					<div class="welbex-settings__payment-page__payment__tariffs__item__description">${currentTariff.description}</div>
					<div class="welbex-settings__payment-page__payment__buy-btn payment__buy-btn">Оплатить онлайн</div>
				</div>
				</div >
			</div>
			` 
		},
		
		// asanaFormTemplate: () => {
		// 	return `
		// 		<form class="asana-form" style="display: flex; flex-direction: column;">
		// 			<label class="form-label">
		// 				api token аккаунта асана
		// 				<input type="password" name="asanaToken" class="asanaToken" autocomplete=off>
		// 			</label>
		// 			<label class="form-label">
		// 				ID задачи
		// 				<input type="text" name="taskId" class="taskId" autocomplete=off>
		// 			</label>
		// 			<label class="form-label">
		// 				Текст комментария
		// 				<textarea name="" id="" cols="30" rows=5" class="setComment"></textarea>
		// 			</label>
		// 			<button type="submit" data-action="setComment">
		// 				Отправить комментарий
		// 			</button>
		// 		</form>`
		// },
			asanaTemplateForm: () => {
			return `
				<form class="asana-form" style="display: flex; flex-direction: column;">
					<label class="welbex_ad_settings__form-label">
						Название шаблона
						<input type="text" name="templateName" class="welbex_ad_settings__input" autocomplete=off>
					</label>
					<label class="welbex_ad_settings__form-label">
						Название задачи
						<input type="text" name="taskName" class="welbex_ad_settings__input" autocomplete=off>
					</label>
					<label class="welbex_ad_settings__form-label">
						Текст шаблона
						<textarea name="templateText" id="" cols="30" rows=5" class="welbex_ad_settings__textarea"></textarea>
					</label>
					<label class="welbex_ad_settings__form-label">
						ID проекта
						<input type="text" name="projectId" class="welbex_ad_settings__input" autocomplete=off>
					</label>
					<button type="button" data-action="deleteTemplate">
						${Components.DeleteButtonIcon()}
					</button>
				</form>`
		},
			
		asanaTokenSettingsTemplate: () => {
				return `<label class="welbex_ad_settings__form-label">
						API-токен
						<input type="text" name="apiToken" class="welbex_ad_settings__input" autocomplete=off>
					</label>`
		},

		asanaCommentTaskTemplate: (commentText) => {
			return {
				data: {
					html_text: `<body>${commentText}</body>`,
					is_pinned: false,
					text: `${commentText}`
				}
			}
		}
	}
})
