"use strict";
Object.defineProperty(exports,"__esModule",{value:true});
function reset(com){
  removeSortStatus(com.sortTarget);
  com.sortTarget=null;
  com.sortField=null;
  com.append=false;
  com.pageIndex=1;
}
exports.reset=reset;
function changePageSize(com,size){
  com.initPageSize=size;
  com.pageSize=size;
  com.pageIndex=1;
}
exports.changePageSize=changePageSize;
function changePage(com,pageIndex,pageSize){
  com.pageIndex=pageIndex;
  com.pageSize=pageSize;
  com.append=false;
}
exports.changePage=changePage;
function optimizeSearchModel(obj,searchable,displayFields){
  obj.fields=displayFields;
  if (searchable.pageIndex && searchable.pageIndex > 1){
    obj.page=searchable.pageIndex;
  }
  else {
    delete obj.page;
  }
  obj.limit=searchable.pageSize;
  if (searchable.appendMode && searchable.initPageSize !== searchable.pageSize){
    obj.firstLimit=searchable.initPageSize;
  }
  else {
    delete obj.firstLimit;
  }
  if (searchable.sortField && searchable.sortField.length > 0){
    obj.sort=(searchable.sortType === '-' ? '-' + searchable.sortField : searchable.sortField);
  }
  else {
    delete obj.sort;
  }
  return obj;
}
exports.optimizeSearchModel=optimizeSearchModel;
function append(list,results){
  if (list && results){
    for (var _i=0,results_1=results;_i < results_1.length;_i++){
      var obj=results_1[_i];
      list.push(obj);
    }
  }
  return list;
}
exports.append=append;
function showResults(s,sr,com){
  com.pageIndex=(s.page && s.page >= 1 ? s.page : 1);
  if (sr.total){
    com.itemTotal=sr.total;
  }
  if (com.appendMode === false){
    showPaging(s,sr,com);
  }
  else {
    handleAppend(s,sr,com);
  }
}
exports.showResults=showResults;
function handleAppend(s,sr,com){
  if (s.limit === 0){
    com.appendable=false;
  }
  else {
    var pageSize=s.limit;
    if (s.page <= 1){
      pageSize=s.firstLimit;
    }
    if (sr.last === true || sr.results.length < pageSize){
      com.appendable=false;
    }
    else {
      com.appendable=true;
    }
  }
  if (sr && sr.results.length === 0){
    com.appendable=false;
  }
}
exports.handleAppend=handleAppend;
function showPaging(s,sr,com){
  com.itemTotal=sr.total;
  var pageTotal=getPageTotal(sr.total,s.limit);
  com.pageTotal=pageTotal;
  com.showPaging=(com.pageTotal <= 1 ? false : true);
}
exports.showPaging=showPaging;
function getDisplayFields(form){
  var nodes=form.nextSibling;
  var table=nodes.querySelector('table');
  var fields=[];
  if (table){
    var thead=table.querySelector('thead');
    if (thead){
      var ths=thead.querySelectorAll('th');
      if (ths){
        for (var _i=0,ths_1=ths;_i < ths_1.length;_i++){
          var th=ths_1[_i];
          var field=th.getAttribute('data-field');
          if (field){
            fields.push(field);
          }
        }
      }
    }
  }
  return fields;
}
exports.getDisplayFields=getDisplayFields;
function formatResults(results,formatter,locale,sequenceNo,pageIndex,pageSize,initPageSize){
  if (results && results.length > 0){
    var hasSequencePro=false;
    if (formatter){
      for (var _i=0,results_2=results;_i < results_2.length;_i++){
        var obj=results_2[_i];
        if (obj[sequenceNo]){
          hasSequencePro=true;
        }
        formatter.format(obj,locale);
      }
    }
    else {
      for (var _a=0,results_3=results;_a < results_3.length;_a++){
        var obj=results_3[_a];
        if (obj[sequenceNo]){
          hasSequencePro=true;
        }
      }
    }
    if (!hasSequencePro){
      if (!pageIndex){
        pageIndex=1;
      }
      if (pageIndex <= 1){
        for (var i=0;i < results.length;i++){
          results[i][sequenceNo]=i - pageSize + pageSize * pageIndex + 1;
        }
      }
      else {
        for (var i=0;i < results.length;i++){
          results[i][sequenceNo]=i - pageSize + pageSize * pageIndex + 1 - (pageSize - initPageSize);
        }
      }
    }
  }
}
exports.formatResults=formatResults;
function getPageTotal(recordTotal,pageSize){
  if (pageSize <= 0){
    return 1;
  }
  else {
    if ((recordTotal % pageSize) === 0){
      return Math.floor((recordTotal / pageSize));
    }
    return Math.floor((recordTotal / pageSize) + 1);
  }
}
exports.getPageTotal=getPageTotal;
function buildSearchMessage(s,sr,r){
  var results=sr.results;
  if (!results || results.length === 0){
    return r.value('msg_no_data_found');
  }
  else {
    if (!s.page){
      s.page=1;
    }
    var fromIndex=(s.page - 1) * s.limit + 1;
    var toIndex=fromIndex + results.length - 1;
    var pageTotal=getPageTotal(sr.total,s.limit);
    if (pageTotal > 1){
      var msg2=r.format(r.value('msg_search_result_page_sequence'),fromIndex,toIndex,sr.total,s.page,pageTotal);
      return msg2;
    }
    else {
      var msg3=r.format(r.value('msg_search_result_sequence'),fromIndex,toIndex);
      return msg3;
    }
  }
}
exports.buildSearchMessage=buildSearchMessage;
function removeFormatUrl(url){
  var startParams=url.indexOf('?');
  return startParams !== -1 ? url.substring(0,startParams) : url;
}
function addParametersIntoUrl(searchModel,isFirstLoad){
  if (!isFirstLoad){
    var pageIndex=searchModel.page;
    if (pageIndex && !isNaN(pageIndex) && pageIndex <= 1){
      delete searchModel.page;
    }
    var keys=Object.keys(searchModel);
    var currentUrl=window.location.host + window.location.pathname;
    var url_1=removeFormatUrl(currentUrl);
    var _loop_1=function (key){
      var objValue=searchModel[key];
      if (objValue){
        if (key !== 'fields'){
          if (typeof objValue === 'string' || typeof objValue === 'number'){
            if (url_1.indexOf('?') === -1){
              url_1 += "?" + key + "=" + objValue;
            }
            else {
              url_1 += "&" + key + "=" + objValue;
            }
          }
          else if (typeof objValue === 'object'){
            if (objValue instanceof Date){
              if (url_1.indexOf('?') === -1){
                url_1 += "?" + key + "=" + objValue.toISOString();
              }
              else {
                url_1 += "&" + key + "=" + objValue.toISOString();
              }
            }
            else {
              if (Array.isArray(objValue)){
                if (objValue.length > 0){
                  var strs=[];
                  for (var _i=0,objValue_1=objValue;_i < objValue_1.length;_i++){
                    var subValue=objValue_1[_i];
                    if (typeof subValue === 'string'){
                      strs.push(subValue);
                    }
                    else if (typeof subValue === 'number'){
                      strs.push(subValue.toString());
                    }
                  }
                  if (url_1.indexOf('?') === -1){
                    url_1 += "?" + key + "=" + strs.join(',');
                  }
                  else {
                    url_1 += "&" + key + "=" + strs.join(',');
                  }
                }
              }
              else {
                var keysLvl2_1=Object.keys(objValue);
                keysLvl2_1.forEach(function (key2,idx){
                  var objValueLvl2=objValue[keysLvl2_1[idx]];
                  if (url_1.indexOf('?') === -1){
                    if (objValueLvl2 instanceof Date){
                      url_1 += "?" + key + "." + key2 + "=" + objValueLvl2.toISOString();
                    }
                    else {
                      url_1 += "?" + key + "." + key2 + "=" + objValueLvl2;
                    }
                  }
                  else {
                    if (objValueLvl2 instanceof Date){
                      url_1 += "&" + key + "." + key2 + "=" + objValueLvl2.toISOString();
                    }
                    else {
                      url_1 += "&" + key + "." + key2 + "=" + objValueLvl2;
                    }
                  }
                });
              }
            }
          }
        }
      }
    };
    for (var _i=0,keys_1=keys;_i < keys_1.length;_i++){
      var key=keys_1[_i];
      _loop_1(key);
    }
    var p='http://';
    var loc=window.location.href;
    if (loc.length >= 8){
      var ss=loc.substr(0,8);
      if (ss === 'https://'){
        p='https://';
      }
    }
    window.history.replaceState({ path: currentUrl },'',p + url_1);
  }
}
exports.addParametersIntoUrl=addParametersIntoUrl;
function handleSortEvent(event,com){
  if (event && event.target){
    var target=event.target;
    var s=handleSort(target,com.sortTarget,com.sortField,com.sortType);
    com.sortField=s.field;
    com.sortType=s.type;
    com.sortTarget=target;
  }
}
exports.handleSortEvent=handleSortEvent;
function handleSort(target,previousTarget,sortField,sortType){
  var type=target.getAttribute('sort-type');
  var field=toggleSortStyle(target);
  var s=sort(sortField,sortType,field,type);
  if (sortField !== field){
    removeSortStatus(previousTarget);
  }
  return s;
}
exports.handleSort=handleSort;
function sort(preField,preSortType,field,sortType){
  if (!preField || preField === ''){
    var s={
      field: field,
      type: '+'
    };
    return s;
  }
  else if (preField !== field){
    var s={
      field: field,
      type: (!sortType ? '+' : sortType)
    };
    return s;
  }
  else if (preField === field){
    var type=(preSortType === '+' ? '-' : '+');
    var s={ field: field,type: type };
    return s;
  }
}
exports.sort=sort;
function removeSortStatus(target){
  if (target && target.children.length > 0){
    target.removeChild(target.children[0]);
  }
}
exports.removeSortStatus=removeSortStatus;
function toggleSortStyle(target){
  var field=target.getAttribute('data-field');
  if (!field){
    field=target.parentNode.getAttribute('data-field');
  }
  if (!field || field.length === 0){
    return '';
  }
  if (target.nodeName === 'I'){
    target=target.parentNode;
  }
  var i=null;
  if (target.children.length === 0){
    target.innerHTML=target.innerHTML + '<i class="sort-up"></i>';
  }
  else {
    i=target.children[0];
    if (i.classList.contains('sort-up')){
      i.classList.remove('sort-up');
      i.classList.add('sort-down');
    }
    else if (i.classList.contains('sort-down')){
      i.classList.remove('sort-down');
      i.classList.add('sort-up');
    }
  }
  return field;
}
exports.toggleSortStyle=toggleSortStyle;
