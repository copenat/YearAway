<?php
  ini_alter("session.use_cookies","0");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once ('../class/TextParse.class');
  include_once ('../class/Meta.class');
  include_once ('../class/YearAway.class');
  include_once ('../class/Trip.class');
  include_once ('../class/DiaryEntry.class');
  include_once ('../class/DiaryPhotos.class');
  include_once ('../class/World.class');
  include_once('../class/Log.class');
  $log = new Log (1);

  $location=safeHTML($location);
  $section=safeHTML($section);
  $text=safeHTML($text);
  if (!is_numeric($count1))
     $count1=0;
  if (!is_numeric($count2))
     $count2=0;
  if (!is_numeric($diary_name_num))
     $diary_name_num=0;
?>
<html>
<?php
  printMeta();
?>

<body>

<table width="100%" border=0>
  <tr>
     <td colspan="2">
<?php
   include ("../utils/title.php");
?>
     </td>
  </tr>
</table>


<?php
    if ($valid_user->IsValidUser() <= 0)
    {
      print "<p>You have not logged on - you must do so before you " .
            "create a new diary.</p><p>If you are not a registered user, " .
            "<a href=NewUser.php>please register yourself</a></p>"; 

      print "<p><a href=HomePage.php>Return to the Home Page</a></p>";

    }
    elseif($valid_user->GetUserName()==$person && $person!="")
    {
      $ok = 1;

      print "<form action=\"EditDiaryEntry.php\" method=post><table>\n";
      print "<tr><td>&nbsp;</td></tr>";
      print "<tr><td align=left>";


      #check all fields entered
      if ($new_country_id == "")
      {
         print "<p>You have not selected a country. Please re-edit.</p>";
         $ok=0;
      }
      if ($location == "")
      {
         print "<p>Place has been left blank. Please re-edit.</p>";
         $ok=0;
      }
      if ($section == "")
      {
         print "<p>Title has been left blank. Please re-edit.</p>";
         $ok=0;
      }
      if ($text == "")
      {
         print "<p>You haven't entered anything for the diary entry. Please re-edit and add something - people would love to read it. Please re-edit.</p>";
         $ok=0;
      }

      if ($ok)
      {
        $sd = "$start_year".substr("00".$start_month,-2,2).substr("00".$start_day,-2,2);
        $sd_display = $start_day." ".mm2mmm($start_month)." ".$start_year;

        if (!only_alphanumeric($person))
        {
          print "<p>Person must only contain alph-numeric characters. Please re-edit.</p>";
          $ok = 0;
        }
        if (!only_alphanumeric($diary_name))
        {
          print "<p>Diary name must only contain alpha-numeric characters. Please re-edit.</p>";
          $ok = 0;
        }
        if ($start_date!="" && !valid_date($start_date))
        {
          print "<p>Start date isn't a valid date. Please re-edit.</p>";
          $ok = 0;
        }
        if (!only_alphanumeric($surname))
        {
          print "<p>Surname must only contain alpha-numeric characters. Please re-edit.</p>";
          $ok = 0;
        }
        if (($start_day!=""||$start_month!=""||$start_year!="") && !valid_date($sd))
        {
          $sd=""; $sd_display="";
          print "<p>Start date entered isn't a valid date. Please re-edit.</p>";
          $ok = 0;
        }
        if (!valid_country_id($new_country_id))
        {
          print "<p>Country entered was invalid. Please re-edit.</p>";
          $ok = 0;
        }
      }
    
      if ($ok)
      {
        if ($diary_name_num > 0 )
        {
          # Get the selected diary name - it gets passed as a number (diary_name_num)!
          $td = new Trip($person, "");
          $result = $td->check_exists();
          if (! $result)
          {
            $log->add($PHP_SELF.":- Trip->check_exists","person=($person),diary_name=($diary_name) - ".mysql_error());
            $ok=0;
          }
          else
          {
             $i=1;
             while ( $vrow = mysql_fetch_array($result))
             {
               $diary_name_list[$i] = $vrow[0];
               $i++;
             }
  
             if ($diary_name == "" && count($diary_name_list)>=$diary_name_num )
             {
               $diary_name = $diary_name_list[$diary_name_num];
             }
             else
             {
               $ok=0;
             }
          }
        }
      }

      if ($ok && $person!="" && $diary_name!="" )
      {
        $error_msg="<p>An internal error has prevented the submission of this diary entry. Please report this error via email to support@yearaway.com. Please include your diary entry and other details and we will add it for you.</p><p>We apologise for the inconvience.</p>";

        $de = new DiaryEntry($person, $diary_name, "");

        if ( $start_date!="" && $start_date == $sd )
        {
          # if editing (start_date set) but date didn't get changed then just update
          $result =  $de->update_entry ( $sd, $section, $location, $text, "",
                                         $new_country_id, $count1, $count2, 0);
          if ($result)
          {
            print "<p>Successfully updated diary entry dated $sd_display.</p>";
          }
          else
          {
            $log->add($PHP_SELF.":- DiaryEntry->update_entry","sd:($sd),section:($section),location:($location),text:($text),new_country_id:($new_country_id),count1:($count1),count2:($count2),person:($person),diary_name:($diary_name) - ".mysql_error());
            print $error_msg;
            $ok=0;
          }
        }
        else
        {
          # if editing (start_date changed) then delete old start_date, insert new sd -
          # also if new entry (start_date not set) then insert, the delete won't happen.

          if ( $de->diary_entry_exists($sd) )
          {
            print "<p>A diary entry for the $sd_display already exists. Please re-edit and change the date.</p>"; 
            $ok=0;
          }
          else
          {

            $result =  $de->add_entry ( $sd, $section, $location, $text, "",
                                      $new_country_id, $count1, $count2, 0, 0 );
            if ($result)
            {
              $de->delete_entry( $start_date );

              # change the start_date of the photos
              $dph = new DiaryPhotos($person, $diary_name);
              $dph->update_start_date($start_date, 0, $sd);

              print "<p>Successfully added new diary entry dated $sd_display.</p>";
              $log->add($PHP_SELF.":- New diary entry","<a href=DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$sd>DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$sd</a>");
            }
            else
            {
              $log->add($PHP_SELF.":- DiaryEntry->add_entry","sd:($sd),section:($section),location:($location),text:($text),new_country_id:($new_country_id),count1:($count1),count2:($count2),person:($person),diary_name:($diary_name) - ".mysql_error());
              print $error_msg;
              $ok=0;
            }
          }
        }
      }

      if (! $ok )
      {
          print "</td></tr>";
          print "<tr><td>&nbsp;</td></tr>";
          print "<tr><td>&nbsp;</td></tr>";
          print "<tr><td>&nbsp;</td></tr>";
          print "<tr><td align=left><INPUT TYPE=\"submit\" value=\"Re-Edit diary entry to correct above problems\">";
          print "</td></tr>";
          print "<tr><td>&nbsp;</td></tr>";
          print "<tr><td>If you are experiencing problems please email us at support@yearaway.com</td></tr>";
          print "<tr><td>Please include your diary entry and other details and we will add it for you.</td></tr>";
          print "<tr><td>We don't want anybody to lose any work!!</td></tr>";

          print "<tr><td align=center>";

          print "<input type=hidden name=person value=\"$person\">";
          print "<input type=hidden name=diary_name value=\"$diary_name\">";
          print "<input type=hidden name=section value=\"$section\">";
          print "<input type=hidden name=start_year value=$start_year>";
          print "<input type=hidden name=start_month value=$start_month>";
          print "<input type=hidden name=start_day value=$start_day>";
          print "<input type=hidden name=new_country_id value=\"$new_country_id\">";
          print "<input type=hidden name=location value=\"$location\">";
          print "<input type=hidden name=count1 value=$count1>";
          print "<input type=hidden name=count2 value=$count2>";
          print "<input type=hidden name=text value=\"$text\">";
          print "</td></tr>";

          print "</table></form>\n";
      }
      elseif ( $person!="" && $diary_name!="" ) 
      {
         print "<p></p><p><a href=DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$sd>View diary entry dated $sd_display, send notification emails and attach photos</a></p>";
         print "<p></p><p><a href=HomePage.php>Return to the Home Page</a></p>";
      }

    }
?>
</body>
</html>
