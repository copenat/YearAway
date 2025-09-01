<?php
  ini_alter("session.use_cookies","1");
  session_start();                            

  include('../class/ValidUser.class');
  $valid_user = new ValidUser(session_id(),"","");

  include_once('../class/DiaryEntry.class');
  include_once('../class/DiaryPhotos.class');
  include_once('../class/TextParse.class');
  include_once('../class/Meta.class'); 

  if (!only_alphanumeric($person))
    $person="";
  if (!only_alphanumeric($diary_name))
    $diary_name="";
  if (!valid_date($start_date))
    $start_date="";

  $de = new DiaryEntry($person,$diary_name,"");
  $dph = new DiaryPhotos($person,$diary_name);

?>

<html>
<?php
  printMeta();
?>

<body>
<table width="100%" align="left" border=0>
  <tr>
     <td colspan="2">

<?php
   include ("../utils/title.php");
?>

     </td>
  </tr>
  <tr>
     <td>

<?php

  if ( $valid_user->IsValidUser() != 0 &&  $valid_user->GetUserName() == $person )
  {
    print "<form action=\"EditPhoto.php\" method=post>";
    print "<table width=600 align=left border=0 cellpadding=3 cellspacing=3> ";
    print "<input type=hidden name=person value=$person>";
    print "<input type=hidden name=diary_name value=$diary_name>";
    print "<input type=hidden name=start_date value=$start_date>";

    $result = $dph->get_photo($start_date,0); 
    if ($result)
    {
      while ( $row = mysql_fetch_array($result))
      {
        if (isset($submitall))
        {
          $var = "selected_$row[filename]";
          if ( $$var == "yes"  )
          {
            $var = "comment_".$row[filename];
            $sub_comment = safeHTML($$var);
#            print "Submit this ($row[filename]) (".$sub_comment.")\n";
            $dph->update_comment($start_date, $sub_comment, $row[filename]);                

            $var = "order_".$row[filename];
#            print "update_photo_order($start_date, $row[filename], ".$$var."); ";
            $dph->update_photo_order($start_date, $row[filename], $$var); 
          }
        }
        elseif (isset($deleteall))
        {
          $var = "selected_$row[filename]";
          if ( $$var == "yes"  )
          {
#            print "Delete this $row[filename]";
            $dph->delete_entry($start_date, $row[filename]);
          }
        }
      }
    }

    $first_photo = 1;
    $result = $dph->get_photo($start_date,0);
    if ($result)
    {
      while ( $row = mysql_fetch_array($result))
      {
        if ( $first_photo == 1 )
        {
          print "<tr><td colspan=2 align=right>Order By (0-100)</td><td colspan=2 align=right>Tick box to select</td></tr>";
          $first_photo++;
        }
        print " <tr>";
        $type = $dph->get_type($start_date,$row[filename]);
        $full_filename = $dph->get_full_filename($row[filename], $type);

        $new_sizes = $dph->resize_photo("small", $full_filename);
        list($w,$h) = explode(" ", $new_sizes);

        print "<td><img width=$w height=$h src=\"$full_filename\" border=0 ></td>";
        print "<td><input name=\"order_".$row[filename]."\" value=\"$row[photo_order]\" type=\"text\" size=\"3\"></td>";
        print "<td><textarea name=\"comment_".$row[filename]."\" wrap=virtual cols=40 rows=4>$row[comment]</textarea></td>";
        print "<td><input name=\"selected_".$row[filename]."\" value=\"yes\" type=checkbox></td>";
#        print "<td>".$row[filename]."</td>";
        print "<td>&nbsp;</td>";
        print "</tr>"; 
      }
    }
    if ( $first_photo == 1 )
    {
      print "<tr><td colspan=3 align=left valign=top>There are no photos attached to this diary entry.</td></tr>";
    }
    print "</table>";

    print "</td>";
    print "<td valign=top>";

    print "<table width=100% border=0>";
    print "<tr><td>&nbsp;</td></tr>";  
    print "<tr><td><input type=submit name=submitall value=\"Submit all selected changes\"></td></tr>";  
    print "<tr><td>&nbsp;</td></tr>";  
    print "<tr><td><input type=submit name=deleteall value=\"Delete all selected entries   \"></td></tr>";  
    print "<tr><td>&nbsp;</td></tr>";  
    print "<tr><td>&nbsp;</td></tr>";  
    print "<tr><td><a href=DiaryEntry.php?person=$person&diary_name=$diary_name&start_date=$start_date>Return to diary entry dated ".YYYYMMDD_2_displayformat($start_date)."</a></td></tr>";
    print "<tr><td><a href=HomePage.php>Return to the Home Page</a></td></tr>";

    print "<tr><td>&nbsp;</td></tr>";
    print "<tr><td>Hints:</td></tr>";
    print "<tr><td class=help_small>Change the order the photos appear by changing the value of the number in the 'Order By' column. Value must be between 0 and 100. The photo with the lowest value will appear on the diary entry. The others can be viewed in order by selecting the 'See all Photos()' link on the diary entry.</td></tr>";
    print "<tr><td class=help_small>Once you are happy with the caption and the order of a photo select the tick box and press 'Submit all selected changes'.  </td></tr>";
    print "<tr><td>&nbsp;</td></tr>";
    print "</table>";

    print "</td>";
    print "</form>";
  }
?>

  </tr>
</table>
</body>
</html>

