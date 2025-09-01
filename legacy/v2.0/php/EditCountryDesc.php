<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once('../class/TextParse.class');

  if (!valid_country_id($country_id))
    $country_id="";

  include_once('../class/Country.class'); 
  include_once('../class/Meta.class'); 
?>

<html>
<?php
  printMeta();
?>

<body>

<table width="100%" border="0">
  <tr>
     <td colspan="2">

<?php
   include ("../utils/title.php");
?>

     </td>
  </tr>
</table>

<?php
    if ($valid_user->IsValidUser() > 0 && $valid_user->GetUserName() == "sue_and_nathan")
    {
      print "<form action=\"SubmitNewCountryDesc.php?" . SID . "\" method=post>";
      $ctry = new Country( $country_id ); 
?>

<table align=center border=0>
<tr>
  <td colspan=2 align=left> 
<?php
      print "Country: ".$ctry->get_name();
      print "<input type=hidden name=country_id value=$country_id>";
?>
  </td> 
</tr>

<tr>
  <td align=left colspan=2>Description for Country</td>
</tr>
 <tr>
<?php
      print "<td colspan=2> <textarea name=\"country_desc\" cols=80 rows=25 wrap=soft>".$ctry->get_description()."</textarea> </td>"
?>
</tr>
</table>

<table align=center>
<tr><td align=center>
<input type="submit" value="Submit Changes">&nbsp;&nbsp;<input type="reset">
</td>
</tr>
</table>
</form>
<?php
    }
?>
</body>
</html>

