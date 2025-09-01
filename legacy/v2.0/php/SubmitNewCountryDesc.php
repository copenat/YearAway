<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include_once('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once ('../class/Country.class');
  include_once ('../class/TextParse.class');
  include_once('../class/Meta.class');
?>
<html>
<?php
   printMeta();
?>

<body>
<form action=EditCountryDesc.php method=POST>
<table width=100% align="left" border="0">
  <tr>
    <td colspan="2">
<?php
  include_once("../utils/title.php");
?>
    </td>
  </tr>
  <tr>
  <td>

<?php
    $ok = 1;

#print $country_id.$country_desc.$valid_user->GetUserName().$valid_user->IsValidUser();

    if ( !valid_country_id($country_id) )
    {
       $ok = 0;
       print "<p>Invalid Country id : $country_id</p>";
    }

    if ($ok && $valid_user->IsValidUser() > 0 && $valid_user->GetUserName() == "sue_and_nathan")
    {
       $ctry = new Country($country_id);
       $result = $ctry->update_description($country_desc);

       if ($result)
          print "<p>Update successful</p>";
    }



    if ( !$ok )
    {


      print "<input type=hidden name=country_id value=$country_id>\n";
      print "<input type=hidden name=country_desc value=$country_desc>\n";

      print "<input type='submit' value='Re-Enter User Details'>\n";
    }

    print "<p></p><p><a href=Country.php?country=$country_id>Return to Country ".$ctry->get_name()."</a>";
    print "<p></p><p><a href=HomePage.php>Return to the Home Page</a>";

?>
  </td>
  </tr>
</table>
</form>
</body>
</html>

