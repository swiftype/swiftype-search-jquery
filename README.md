Swiftype Search jQuery Plugin
=========

The official [Swiftype](http://www.swiftype.com) jQuery plugin for adding search functionality backed by data from the Swiftype Search API. Learn more about Swiftype by visiting [swiftype.com](http://www.swiftype.com) and creating an account.

Prerequisites
------------
1. A Swiftype account. Sign up at [swiftype.com](http://www.swiftype.com).
2. A Swiftype search engine with some data in it.


Installation
------------

Include the following in the header of your webpage:

* the latest version of jQuery
* the [hashchange](https://github.com/cowboy/jquery-hashchange) jQuery plugin (version included)
* the Swiftype Search jQuery plugin
* (optional) the Swiftype Search stylesheet

All together it should look like this:

```html
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script type='text/javascript' src='jquery.ba-hashchange.min.js'></script>
<script type="text/javascript" src="jquery.swiftype.search.js"></script>
<link type="text/css" rel="stylesheet" href="search.css" media="all" />
```


Basic Usage
-----

Start by having at least these three elements on the page: a form, an input field within the form, and a container for results.

```html
<form>
  <input type='text' placeholder='Search' id='st-search-input' />
</form>
<div id="st-results-container"></div>
```

Simply apply the swiftype method to an existing search input field within a form on your webpage and provide a container for results. For example, add it to a search input field with id `st-search-input` as follows:

```js
$('#st-search-input').swiftypeSearch({
  resultContainingElement: '#st-results-container',
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

Be sure to change the `engineKey` attribute shown above to match the one assigned to your Swiftype search engine. If you are using the web interface, the search engine key is listed on the first page of your dashboard.


Customization Tutorial
-------------

This plugin is written to be flexible based on your specific use-case. 
For example you might want to retrieve more data for each result, customize
the way data is display to the user, or restrict the search query to certain elements of your search engine. 

Let's go through an example that does all of this. For this example, let's assume you followed the QuickStart tutorial for our [Ruby Gem](https://github.com/swiftype/swiftype-rb), and now you have data for a Bookstore indexed in your example search engine.

#### Changing the number of results per page

To specify the number of results per page, use the `perPage` attribute.

```js
$('#st-search-input').swiftypeSearch({ 
  engineKey: 'jaDGyzkR6iYHkfNsPpNK',
  perPage: 20
});
```
        
The maximium value that will be honored by the API is 100.

#### Returning a matching highlight snippet

Any fields that are queried during a search will return the top match (if any) in the highlight property of the results. All snippets in this form have HTML entities from the original text encoded. Actual highlighting is specified using (unencoded) `<em>` tags.

You can customize which fields are returned in the highlight property by using the `highlightFields` option:

```JavaScript
$('#st-search-input').swiftypeSearch({
  renderFunction: customRenderFunction,
  fetchFields: {'books': ['title','genre','published_on']},
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
  highlightFields: {'books': {'body': {'size': 300, 'fallback': true }}}
});
```

The `highlightFields` option accepts a hash containing the fields you want to have highlighted for each object of each document type. For each field, specify `size` as the maximum number of characters to include in the snippet. Set `fallback` to true to force inclusion of a non-highlighted snippet if a highlight is not available for that field.

See the [custom.html](https://github.com/swiftype/swiftype-search-jquery/blob/master/custom.html) file for an additional example of `highlightFields`.

#### Fetching only the fields you specify

To specify the fields you would like returned from the API, set the `fetchFields` attribute to a hash containing an array listing the fields you want returned for each document type. For example, if you have indexed `title`, `genre`, and `published_on` fields for each document, you can have them returned as follows:

```js
$('#st-search-input').swiftypeSearch({ 
  fetchFields: {'books': ['title','genre','published_on']},
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

These additional fields will be returned with each item, and they can be accessed in the rendering function as shown in the next section.

#### Customizing the display

Now that you have more data for each result item, you'll want to customize the item rendering function to make use of them.

The default rendering function is shown below:

```js
var defaultRenderFunction = function(document_type, item) {
  return '<div class="st-result"><h3 class="title"><a href="' + item['url'] + '" class="st-search-result-link">' + item['title'] + '</a></h3></div>';
};
```

The additional fields are available as keys in the item dictionary, so you could customize this to make use of the `genre` field as follows:

```js
var customRenderFunction = function(document_type, item) {
  var out = '<a href="' + item['url'] + '" class="st-search-result-link">' + item['title'] + '</a>';
  return out.concat('<p class="genre">' + item['genre'] + '</p>');
};
```

Now simply set the `renderFunction` attribute in the options dictionary to your `customRenderFunction` to tell our plugin to use your function to render results:

```js
$('#st-search-input').swiftypeSearch({ 
  renderFunction: customRenderFunction,
  fetchFields: {'books': ['title','genre','published_on']},
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

#### Restricting matching to particular fields

By default, the Swiftype search library will match the submitted query to any `string` or `text` field indexed for your documents. So if you would like to ensure that it only matches entries in the `title` field, for example, you can specify the `searchFields` option:

```
$('#st-search-input').swiftypeSearch({ 
  renderFunction: customRenderFunction,
  fetchFields: {'books': ['title','genre','published_on']},
  searchFields: {'books': ['title']},
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```

Similarly to the `fetchFields` option, `searchFields` accepts a hash containing an array of fields for each document_type on which you would like the user's query to match. 

#### Specifying additional query conditions

Now let's say you only want your results to display books that are of the **fiction** `genre` and are **in_stock**. In order to restrict search results, you can pass additional query conditions to the search API by specifying them as a dictionary in the `filters` field. Multiple clauses in the filters field are combined with AND logic:

```js
$('#st-search-input').swiftypeSearch({ 
  renderFunction: customRenderFunction,
  fetchFields: {'books': ['title','genre','published_on']},
  filters: {'books': {'genre': 'fiction', 'in_stock': true}},
  searchFields: {'books': ['title']},
  engineKey: 'jaDGyzkR6iYHkfNsPpNK'
});
```


Questions?
----------
Get in touch! We would be happy to help you get up and running. 
