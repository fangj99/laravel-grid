import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

export class Utils {

  static handleAjaxRequest = (element, event, options) => {
    event = event || 'click';
    if (element.length < 1) return;

    element.each((i, obj) => {
      obj = $(obj);
      // confirmation
      const confirmation = obj.data('trigger-confirm');
      const confirmationMessage = obj.data('confirmation-msg') || 'Are you sure?';
      const pjaxContainer = obj.data('pjax-target');
      const refresh = obj.data('refresh-page');
      const isForm = obj.is('form');

      obj.on(event, e => {
        e.preventDefault();
        if (confirmation) {
          if (!confirm(confirmationMessage)) {
            return;
          }
        }
        $.ajax({
          method: isForm ? obj.attr('method') : (obj.data('method') || 'POST'),
          url: isForm ? obj.attr('action') : obj.attr('href'),
          data: isForm ? obj.serialize() : null,
          beforeSend() {
            if (options.beforeSend) {
              options.beforeSend.call(this)
            }
          },
          complete() {
            if (options.onComplete) {
              options.onComplete.call(this)
            }
          },
          success(data) {
            if (pjaxContainer) {
              $.pjax.reload({container: pjaxContainer});
            }
          },
          error(data) {
            if (typeof toastr !== 'undefined') {
              toastr.error('An error occurred', 'Whoops!');
            } else {
              alert('An error occurred');
            }
          },
        });
      });
    });
  };

  static tableLinks = options => {
    if (!options) {
      console.warn('No options defined.');
    } else {
      const elements = $(options.element);
      elements.each((i, obj) => {
        const el = $(obj);
        const link = el.data('url');
        el.css({'cursor': 'pointer'});
        el.click(e => {
          setTimeout(() => {
            window.location = link;
          }, options.navigationDelay || 100);
        });
      });
    }
  };

  /**
   * Return html that can be used to render a bootstrap alert on the form
   *
   * @param type
   * @param response
   * @returns {string}
   */
  static renderAlert(type, response) {
    const validTypes = ['success', 'error', 'notice'];
    let html = '';
    if (typeof type === 'undefined' || ($.inArray(type, validTypes) < 0)) {
      type = validTypes[0];
    }
    if (type === 'success') {
      html += '<div class="alert alert-success">';
    }
    else if (type === 'error') {
      html += '<div class="alert alert-danger">';
    } else {
      html += '<div class="alert alert-warning">';
    }
    html += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
    // add a heading
    if (type === 'error') {
      if(response.serverError) {
        html += response.serverError.message || 'A server error occurred.';
        html = `<strong>${html}</strong>`;
        return html;
      } else {
        html += response.message || 'Please fix the following errors';
        html = `<strong>${html}</strong>`;
        const errs = this.getValidationErrors(response.errors || {});
        return `${html + errs}</div>`;
      }
    } else {
      return `${html + response}</div>`;
    }
  };

  /**
   * process validation errors from json to html
   * @param response
   * @returns {string}
   */
  static getValidationErrors(response) {
    let errorsHtml = '';
    $.each(response, (key, value) => {
      errorsHtml += `<li>${value}</li>`;
    });
    return errorsHtml;
  };

  /**
   * Form submission from a modal dialog
   *
   * @param formId
   * @param modal
   */
  static handleFormSubmission(formId, modal) {
    const form = $(`#${formId}`);
    const submitButton = form.find(':submit');
    const data = form.serialize();
    const action = form.attr('action');
    const method = form.attr('method') || 'POST';
    const originalButtonHtml = $(submitButton).html();
    const pjaxTarget = form.data('pjax-target');
    const notification = form.data('notification-el') || 'modal-notification';

    $.ajax({
      type: method,
      url: action,
      data,
      dataType: 'json',
      success(response) {
        if (response.success) {
          let message = '<i class=\"fa fa-check\"></i> ';
          message += response.message;
          $(`#${notification}`).html(Utils.renderAlert('success', message));
          // if a redirect is required...
          if (response.redirectTo) {
            setTimeout(() => {
              window.location = response.redirectTo;
            }, response.redirectTimeout || 500);
          } else {
            // hide the modal after 1000 ms
            setTimeout(() => {
              modal.modal('hide');
              if (pjaxTarget) {
                // reload a pjax container
                $.pjax.reload({container: pjaxTarget});
              }
            }, 500);
          }
        }
        else {
          // display message and hide modal
          const el = $(notification);
          el.html(Utils.renderAlert('error', response.message));
          setTimeout(() => {
            modal.modal('hide');
          }, 500);
        }
      },
      beforeSend() {
        $(submitButton).attr('disabled', 'disabled').html('<i class="fa fa-spinner fa-spin"></i>&nbsp;loading');
      },
      complete() {
        $(submitButton).html(originalButtonHtml).removeAttr('disabled');
      },
      error(data) {
        let msg;
        // error handling
        switch (data.status) {
          case 500:
            msg = Utils.renderAlert('error', {serverError: {message: "An error occurred on the server."}});
            break;
          default:
            msg = Utils.renderAlert('error', data.responseJSON);
            break;
        }
        // display errors
        const el = $(`#${notification}`);
        el.html(msg);
      },
    });
  };
}