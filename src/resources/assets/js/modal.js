import {Utils as utils} from './utils';
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

export class Modal {
  options = {};

  constructor(options) {
    this.options = $.extend({}, this.options, options || {});
  }

  /**
   * Show a modal dialog dynamically
   */
  show() {
    $('.show_modal_form').on('click', function(e) {
      e.preventDefault();
      const btn = $(this);
      const btnHtml = btn.html();
      const modalDialog = $('#bootstrap_modal');
      const modalSize = btn.data('modal-size');
      // show spinner as soon as user click is triggered
      btn.attr('disabled', 'disabled').
          html('<i class="fa fa-spinner fa-spin"></i>&nbsp;loading');

      // load the modal into the container put on the html
      $('.modal-content').
          load($(this).attr('href') || $(this).data('href'), () => {
            // show the modal
            $('#bootstrap_modal').modal({show: true});
            // alter size
            if (modalSize) {
              $('.modal-content').parent('div').addClass(modalSize);
            }
          });

      // revert button to original content, once the modal is shown
      modalDialog.on('shown.bs.modal', e => {
        $(btn).html(btnHtml).removeAttr('disabled');
      });

      // destroy the modal
      modalDialog.on('hidden.bs.modal', function(e) {
        $(this).modal('dispose');
      });
    });
  }

  addListener() {
    $('#bootstrap_modal').
        on('click', '#' + 'modal_form' + ' button[type="submit"]', e => {
          e.preventDefault();
          // process forms on the modal
          utils.handleFormSubmission('modal_form',
              $('#bootstrap_modal'));
        });
  }
}