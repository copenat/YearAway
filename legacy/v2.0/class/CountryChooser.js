
function populateCountry(inForm, selected) 
{
  var selectedArray = eval(selected + "Array");
  var count1;

  while (selectedArray.length < inForm.new_country_id.options.length)
  {
    inForm.new_country_id.options[(inForm.new_country_id.options.length - 1)] = null;
  }

  for (count1=0; count1 < selectedArray.length; count1++) 
  {
      eval("inForm.new_country_id.options[count1]= new Option ('" + selectedArray[count1][0] +"','"+selectedArray[count1][1]+"',false,false)" );
  }
  inForm.new_country_id.options[0].selected = true;
}

function setCountryToDefault(inForm)
{
  inForm.new_country_id.options[0].selected = true;
}

