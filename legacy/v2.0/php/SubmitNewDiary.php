<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include_once('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  if (!only_alphanumeric($person))
    $person="";

  #if only spaces then clear it
  if ( ereg("^( +)$", $diary_name) )
    $diary_name="";

  #Replace any spaces with _ in diary_name
  $diary_name=ereg_replace(" ","_",$diary_name); 

  if (!only_alphanumeric($diary_name))
    $diary_name="";
  if (!valid_date($start_date))
    $start_date="";

  include_once('../class/Trip.class');
  include_once('../class/Meta.class');
  include_once('../class/Log.class');
  $log = new Log (1);
?>
<html>
<?php
   printMeta();
?>

<body>
<form action=NewDiary.php method=POST>
<table align="left" border="0" width=100%>
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
    $te = new Trip($person,"");
    include_once ('../class/TextParse.class');

    $ok = 1;

    if (!only_alphanumeric($person))
    {
      $person="";
      $ok=0;
    }
    $person    = chop ($person);
    $diary_name = chop ($diary_name);
    $diary_details  = chop ($diary_details);

    /* check all fields entered */
    if ($diary_name == "") 
    {
      print "<p>Diary name has been left blank</p>\n";
      $ok = 0;
    }
    if ($ok && !only_alphanumeric($diary_name))
    {
      print "<p>Diary name must only contain alpha-numeric characters</p>";
      $diary_name="";
      $ok = 0;
    }

    if ($ok)
    {
      $result = $te->check_exists();
      $diary_name_found = 0;

      if (! $result)
        $log->add($PHP_SELF.":- Trip->check_exists","person=($person),diary_name=($diary_name) - ".mysql_error());
      else
      {
        while ( $row = mysql_fetch_array($result))
        {
          if ( $row[diary_name] == $diary_name )
            $diary_name_found = 1;
        }
      }
    }

    if ($ok)
    {
      $te = new Trip ($person, $diary_name);
      $diary_details = safeHTML($diary_details);

      if ( $diary_name_found )
      {
        $result = $te->update_trip_mesg($diary_details);
        if ($result)
          print "Succuessfully updated the description of diary $diary_name for $person.";
        else
        {
          print "An internal error has occurred whilst attempting to update the diary $diary_name for $person. Please report this error via email to support@yearaway.com. Please include the details of the changes and we will make them for you.</p><p>We apologise for the inconvience.</p>";
          $ok = 0;
          $log->add($PHP_SELF.":- Trip->update_trip_mesg","diary_details:($diary_details),person:($person),diary_name:($diary_name) - ".mysql_error());
        }
      }
      else
      {
        $result = $te->add_trip_mesg($diary_details);
        if ($result)
        {
          print "Succuessfully added new diary $diary_name for $person.";
          $log->add($PHP_SELF.":- New diary","New diary added by user ($person) diary ($diary_name)");
        }
        else
        {
          print "An internal error has occurred whilst attempting to add new diary $diary_name for $person. Please report this error via email to support@yearaway.com. Please include the details of the changes and we will make them for you.</p><p>We apologise for the inconvience.</p>";
          $ok = 0;
          $log->add($PHP_SELF.":- Trip->add_trip_mesg","diary_details:($diary_details),person:($person),diary_name:($diary_name) - ".mysql_error());
        }
      }
    }

    if ( !$ok )
    {

      print "<input type=hidden name=person value='$person'>\n";
      print "<input type=hidden name=diary_name value='$diary_name'>\n";
      print "<input type=hidden name=diary_details value='$diary_details'>\n";

      print "<br><INPUT TYPE='submit' value='Re-Enter User Details'>\n";
    }
    else
    {
      print "<p></p><p><a class=visited_country_link href=\"NewDiary.php?person=$person&diary_name=$diary_name\">Return to Edit Diary Details</a></p>";
    }

    print "<p></p><p><a href=HomePage.php>Return to the Home Page</a>"; 

?>
  </td>
  </tr>
</table>
</form>
</body>
</html>

