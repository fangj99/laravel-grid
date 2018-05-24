import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

export class GridClass {

  defaults = {
    /**
     * The ID of the html element containing the grid
     */
    id: '#some-grid',
    /**
     * The ID of the html element containing the filter form
     */
    filterForm: undefined,
    /**
     * The ID of the html element containing the search form
     */
    searchForm: undefined,
    /**
     * The CSS class of the columns that are sortable
     */
    sortLinks: 'data-sort',
    /**
     * The selector of a date range filter
     */
    dateRangeSelector: '.date-range',
    /**
     * PJAX
     */
    pjax: {
      /**
       * Any extra pjax plugin options
       */
      pjaxOptions: {},

      /**
       * Something to do once the PJAX request has been finished
       */
      afterPjax(e) {
      },
    },
  };

  constructor(opts) {
    this.opts = $.extend({}, this.defaults, opts || {});
  }

  /**
   * Enable pjax
   *
   * @param container the root element for which html contents shall be replaced
   * @param target the element in the root element that will trigger the pjax request
   * @param afterPjax a function that will be executed after the pjax request is done
   * @param options
   */
  setupPjax(container, target, afterPjax, options) {
    // global timeout
    $.pjax.defaults.timeout = options.timeout || 3000;
    $(document).pjax(target, container, options);
    $(document).on('ready pjax:end', event => {
      afterPjax($(event.target));
      // internal calls
      this.setupDateRangePicker();
    });
  }

  /**
   * Initialize pjax functionality
   */
  bindPjax() {
    this.setupPjax(
        this.opts.id,
        'a[data-trigger-pjax=1]',
        this.opts.pjax.afterPjax,
        this.opts.pjax.pjaxOptions,
    );

    this.setupDateRangePicker();
  }

  /**
   * Pjax per row filter
   */
  filter() {
    const form = $(this.opts.filterForm);

    if (form.length > 0) {
      $(document).on('submit', this.opts.filterForm, event => {
        $.pjax.submit(event, this.opts.id, this.opts.pjax.pjaxOptions);
      });
    }
  }

  /**
   * Pjax search
   */
  search() {
    const form = $(this.opts.searchForm);

    if (form.length > 0) {
      $(document).on('submit', this.opts.searchForm, event => {
        $.pjax.submit(event, this.opts.id, this.opts.pjax.pjaxOptions);
      });
    }
  }

  /**
   * Setup date range picker
   *
   */
  setupDateRangePicker() {
    if (this.opts.dateRangeSelector) {
      if (typeof daterangepicker !== 'function') {
        console.warn('date range picker option requires https://github.com/dangrossman/bootstrap-daterangepicker.git');
      } else {
        const start = moment().subtract(29, 'days');
        const end = moment();
        const element = $(this.opts.dateRangeSelector);
        element.daterangepicker({
          startDate: start,
          endDate: end,
          ranges: {
            'Last 7 Days': [
              moment().subtract(6, 'days'), moment()
            ],
            'Last 30 Days': [
              moment().subtract(29, 'days'), moment()
            ],
            'This Month': [
              moment().startOf('month'), moment().endOf('month')
            ],
            'Last Month': [
              moment().subtract(1, 'month').startOf('month'),
              moment().subtract(1, 'month').endOf('month')
            ],
          },
          autoUpdateInput: false,
          locale: {
            format: 'YYYY-MM-DD',
            cancelLabel: 'Clear',
          },
        });

        element.on('apply.daterangepicker', function(ev, picker) {
          $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
        });

        element.on('cancel.daterangepicker', function(ev, picker) {
          $(this).val('');
        });
      }
    }
  }
}