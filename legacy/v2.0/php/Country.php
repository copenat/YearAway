<?php
   ini_alter("session.use_cookies","1");
   session_start();

   include_once('../class/ValidUser.class');
   $valid_user = new ValidUser(session_id(),"","");

   include_once('../class/DiaryEntry.class');
   include_once('../class/DiaryPhotos.class');
   include_once('../class/Country.class');
   include_once('../class/Meta.class');
   include_once('../class/Log.class');
   $log = new Log (1);

   if (!only_alphanumeric($person))
     $person="";
   if (!only_alphanumeric($diary_name))
     $diary_name="";
   if (!valid_country_id($country))
     $country="";

   $de = new DiaryEntry($person, $diary_entry, $country);
   $ctry = new Country($country);

   $map_dir = "../graphics";
?>
<html>
<?php
   printMeta();
?>

<body>
<table width="100%" align="left" border="0">
  <tr>
    <td colspan=2>
<?php
   include ("../utils/title.php");
?>
    </td>
  </tr>

  <tr>
    <td valign ="top" width=30%>

      <table valign="top">
        <tr valign="top">
<?php
   $map = $map_dir."/".$ctry->get_map();
   if ( file_exists( $map ) )
      print "<td valign=top><img src=\"$map\" ".
              "alt=\"".$ctry->get_name()." is coloured yellow\" ></td>";
   else
      print "<td valign=top><img src=\"".$map_dir."/NOMAP.gif\" ></td>";
   print "</tr>";

   if ( $valid_user->IsValidUser() != 0 && $valid_user->GetUserName() == "sue_and_nathan" )
   {
     print "<tr><td><a href=\"EditCountryDesc.php?country_id=".$ctry->get_id()."\">Edit Country Description</a></td></tr>";
   }
?>
        <tr><td valign=top align=left>

          <table border="0" align=left>

<?php
    print "<tr><td class=visited_country_text>Other countries with diary entries</td></tr>";
    $result = $de->get_country_count("","",$ctry->get_id(),0,"" );

    if ( !$result )
      $log->add($PHP_SELF .":- DiaryEntry->get_country_count","ctry_id:(".$ctry->get_id()."),person:($person),diary_name:($diary_name) - ".mysql_error());
    else
    {
      while ( $row = mysql_fetch_array($result))
        print "<tr><td><a class=visited_country_link href=\"Country.php?country=$row[country_id]\">$row[country_name] ($row[total])</a></td></tr>\n";
    }
?>
          </table>

        </td></tr>
      </table>
    </td>

    <td valign=top align=left>

<?
    print "<span class=country_desc>".$ctry->get_description()."</span>";
?>

<?php

  $result = $de->get_entries("","","","","",0,"desc");

  if (! $result)
    $log->add($PHP_SELF .":- DiaryEntry->get_entries","person:($person),diary_name:($diary_name) - ".mysql_error());
  else
  {
    print "<table width=\"100%\" border=\"0\" cellpadding=0>";
    print "<tr>";
    print "<td></td>";
    print "<td class=diary_date>Date</td>";
    print "<td class=diary_author>Location</td>";
    print "<td class=diary_title>Title</td>\n";
    print "<td class=diary_name>Diary</td>";
    print "<td class=diary_location>Author</td>";
    print "</tr>";


    while ( $row = mysql_fetch_array($result))
    {
      $link="href=\"DiaryEntry.php?person=$row[user_name]&diary_name=$row[diary_name]&start_date=$row[start_date]\"";

      $photo_num = 0;
      $dph = new DiaryPhotos($row[user_name], $row[diary_name]);

      $ph_res = $dph->get_photo_count($row[start_date]);
      if ( $ph_res )
      {
        if ( $photo = mysql_fetch_array($ph_res) )
          $photo_num = $photo[num_of_photos];
      }

      print "<tr>";
      if ( $photo_num > 0 )
        print "<td><a class=diary_link $link><img border=0 width=20  src=\"../graphics/camera.gif\"></a></td>";
      else
        print "<td></td>";
      print "<td><a class=diary_link $link>$row[start_date_disp]</a></td>";
      print "<td><a class=diary_link $link>$row[location]</a></td>";
      print "<td><a class=diary_link $link>$row[section]</a></td>";
      print "<td><a class=diary_link $link>$row[diary_name]</a></td>";
      print "<td><a class=diary_link $link>$row[user_name]</a></td>";
      print "</tr>\n";
    }
    print "</table>";
  }
?>
    </td>

  </tr>
</table>
</body>
</html>


