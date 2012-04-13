(function ($) {
  var queryParser = function (a) {
      var i, p, b = {};
      if (a === "") {
        return {};
      }
      for (i = 0; i < a.length; i += 1) {
        p = a[i].split('=');
        if (p.length === 2) {
          b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
      }
      return b;
    };
  $.queryParams = function () {
    return queryParser(window.location.search.substr(1).split('&'));
  };
  $.hashParams = function () {
    return queryParser(window.location.hash.substr(1).split('&'));
  };


  window.Swiftype = window.Swiftype || {};
  Swiftype.root_url = Swiftype.root_url || 'http://api.swiftype.com';
  Swiftype.pingUrl = function (endpoint, callback) {
    var img = new Image();
    img.onload = img.onerror = callback;
    img.src = endpoint;
    setTimeout(callback, 350);
    return false;
  };
  Swiftype.pingSearchResultClick = function (engineKey, docId, callback) {
    var params = {
      t: new Date().getTime(),
      engine_key: engineKey,
      doc_id: docId,
      q: Swiftype.currentQuery
    };
    var url = Swiftype.root_url + '/api/v1/public/analytics/pc?' + $.param(params);
    Swiftype.pingUrl(url, callback);
  };

  $.fn.swiftypeSearch = function (options) {
    var options = $.extend({}, $.fn.swiftypeSearch.defaults, options);

    return this.each(function () {
      var $this = $(this);
      var config = $.meta ? $.extend({}, options, $this.data()) : options;
      $this.data('swiftype-config', config);

      $this.selectedCallback = function (data) {
        return function (e) {
          var $el = $(this);
          e.preventDefault();
          Swiftype.pingSearchResultClick(config.engineKey, data['id'], function() {
            window.location = $el.attr('href');
          });
        };
      };

      $this.registerResult = function ($element, data) {
        $element.data('swiftype-item', data);
        $('a', $element).click($this.selectedCallback(data));
      };

      $this.getContentCache = function () {
        return $('#' + contentCacheId);
      };

      var $resultContainer = $(config.resultContainingElement),
        initialContentOfResultContainer = $resultContainer.html(),
        contentCacheId = 'st-content-cache',
        $contentCache = $this.getContentCache();

      var setSearchHash = function (query, page) {
          location.hash = "stq=" + query + "&stp=" + page;
        };

      var submitSearch = function (query, options) {
          options = $.extend({
            per_page: 10,
            page: 1
          }, options);
          var params = {};

          if (!$contentCache.length) {
            $resultContainer.after("<div id='" + contentCacheId + "' style='display: none;'></div>");
            $contentCache.html(initialContentOfResultContainer).hide();
          }
          $resultContainer.html('<p class="st-loading-message">loading...</p>');

          Swiftype.currentQuery = query;
          params['q'] = query;
          params['engine_key'] = config.engineKey;
          params['page'] = options.page;
          params['per_page'] = options.per_page;

          if (config.searchFields !== undefined) {
            params['search_fields'] = config.searchFields;
          }
          if (config.fetchFields !== undefined) {
            params['fetch_fields'] = config.fetchFields;
          }
          if (config.filters !== undefined) {
            var filters = config.filters;
            if (typeof filters === 'function') {
              filters = filters.call();
            }
            params['filters'] = filters;
          }
          if (config.documentTypes !== undefined) {
            params['document_types'] = config.documentTypes;
          }
          if (config.functionalBoosts !== undefined) {
            params['functional_boosts'] = config.functionalBoosts;
          }
          if (config.sortField !== undefined) {
            var sortField = config.sortField;
            if (typeof sortField === 'function') {
              sortField = sortField.call();
            }
            params['sort_field'] = sortField;
          }
          if (config.sortDirection !== undefined) {
            var sortDirection = config.sortDirection;
            if (typeof sortDirection === 'function') {
              sortDirection = sortDirection.call();
            }
            params['sort_direction'] = sortDirection;
          }

          $.getJSON(Swiftype.root_url + "/api/v1/public/engines/search.json?callback=?", params).success(renderSearchResults);
        };

      $(window).hashchange(function () {
        var params = $.hashParams();
        if (params.stq) {
          submitSearch(params.stq, {
            page: params.stp
          });
        } else {
          var $contentCache = $this.getContentCache();
          if ($contentCache.length) {
            $resultContainer.html(contentCache.html());
            $contentCache.remove();
          }
        }
      });

      var $containingForm = $this.parents('form');
      if ($containingForm) {
        $containingForm.bind('submit', function (e) {
          e.preventDefault();
          var searchQuery = $this.val();
          setSearchHash(searchQuery, 1);
        });
      }

      $('[data-hash][data-page]').live('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        setSearchHash($.hashParams().stq, $this.data('page'));
      });

      var renderSearchResults = function (data) {
          $resultContainer.html('');
          $.each(data.records, function (documentType, items) {
            $.each(items, function (idx, item) {
              $this.registerResult($(config.renderFunction(documentType, item)).appendTo($resultContainer), item);
            });
          });
          renderPagination($this.getContext(), data.info);
        };

      $this.getContext = function () {
        return {
          config: config,
          resultContainer: $resultContainer,
          registerResult: $this.registerResult
        };
      };

      $(window).hashchange(); // if the swiftype query hash is present onload (maybe the user is pressing the back button), submit a query onload
    });
  };

  var renderPagination = function (ctx, resultInfo) {
    var maxPagesType, maxPages = -1;
    $.each(resultInfo, function(documentType, typeInfo) {
      if (typeInfo.num_pages > maxPages) {
        maxPagesType = documentType;
      }
    });
    var currentPage = resultInfo[maxPagesType].current_page,
      totalPages = resultInfo[maxPagesType].num_pages;
    $(renderPaginationForType(maxPagesType, currentPage, totalPages)).appendTo(ctx.resultContainer);
  };

  var renderPaginationForType = function (type, currentPage, totalPages) {
      var pages = '',
        previousPage, nextPage;
      if (currentPage != 1) {
        previousPage = currentPage - 1;
        pages = pages + '<a href="#" class="st-page st-prev" data-hash="true" data-page="' + previousPage + '">&laquo; previous</a>'
      }
      if (currentPage < totalPages) {
        nextPage = currentPage + 1;
        pages = pages + '<a href="#" class="st-page st-next" data-hash="true" data-page="' + nextPage + '">next &raquo;</a>'
      }
      return pages;
    };

  var normalize = function (str) {
      return $.trim(str).toLowerCase();
    };

  var defaultRenderFunction = function (document_type, item) {
      return '<div class="st-result"><h3 class="title"><a href="' + item['url'] + '" class="st-search-result-link">' + item['title'] + '</a></h3></div>';
    };

  $.fn.swiftypeSearch.defaults = {
    attachTo: undefined,
    documentTypes: undefined,
    filters: undefined,
    engineKey: undefined,
    searchFields: undefined,
    functionalBoosts: undefined,
    sortField: undefined,
    sortDirection: undefined,
    fetchFields: undefined,
    renderFunction: defaultRenderFunction
  };
})(jQuery);