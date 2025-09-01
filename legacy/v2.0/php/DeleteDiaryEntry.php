<?php
    ini_alter("session.use_cookies","1");
    session_start();                            

    include_once('../class/ValidUser.class');
    $valid_user = new ValidUser(session_id(),"","");

   if (!only_alphanumeric($person))
     $person="";
   if (!only_alphanumeric($diary_name))
     $diary_name="";
   if (!valid_date($start_date))
     $start_date="";

    include_once('../class/DiaryPhotos.class');
    include_once('../class/DiaryEntry.class');
    $de = new DiaryEntry($person, $diary_name, "");
    $dph = new DiaryPhotos($person, $diary_name);

    include_once('../class/Meta.class');
?>
<html>
<?php
   printMeta();
?>

<body>
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
    $person    = chop ($person);
    $diary_name = chop ($diary_name);
    $start_date  = chop ($start_date);

    if ($valid_user->IsValidUser() <= 0)
    {
      print "<p>You have not logged on - you must do so before you " .
            "create a new diary.</p><p>If you are not a registered user, " .
            "<a href=NewUser.php>please register yourself</a></p>";
      print "<p><a href=HomePage.php>Return to the Home Page</a>";
    }
    elseif ( $person!="" && $diary_name!="" && $start_date!="" && $valid_user->GetUserName() == $person )
    {
      # So now user is logged in. The three vars are set and the valid user is the owner of this entry!

      $result = $de->get_entries("","","",$start_date,"",0,"");
      $diary_entry_found = 0;

      if (! $result)
        $log->add($PHP_SELF.":- DiaryEntry->get_entries","start_date:($start_date),person:($person),diary_name:($diary_name) - ".mysql_error());
      else
      {
        while ( $row = mysql_fetch_array($result))
          $diary_entry_found = 1;  
        $diary_section=$row[section];
        $diary_text=$row[message];
      }

      if ($diary_entry_found)
      {
        $result = $de->delete_entry($start_date);
        if ($result)
        {
          print "The entry for ".YYYYMMDD_2_displayformat($start_date)." has been deleted from diary $diary_name";
          $res = $dph->delete_entry($start_date, 0);
          $log->add($PHP_SELF.":- Delete diary entry","Diary entry deleted by user ($person) diary ($diary_name) : $diary_section\n$diary_text");
        }
        else
        {
          print "An error has occurred whilst deleting";
          print "An internal error has occurred whilst attempting to delete diary entry for $start_date from $person $diary_name. Please report this error via email to support@yearaway.com. Please include the above details so we make the deletion for you.</p><p>We apologise for the inconvience.</p>";
          $log->add($PHP_SELF.":- DiaryEntry->delete_entry","start_date:($start_date),person:($person),diary_name:($diary_name) - ".mysql_error());
        }
      }
    }

    print "<p></p>";
    print "<p><a href=HomePage.php>Return to the Home Page</a>";
?>
  </td>
  </tr>
</table>
</body>
</html>

