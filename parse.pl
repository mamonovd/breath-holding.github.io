while(<>) {
  cmomp;
  if (/Практики, \[/) {
    $_ = ~/([\d\/]+)/;
    @parts = split(/\//, $1);
  } elsif (/([\d,\s]+)\n/) {
    print '{ "d": "'.'20'.$parts[2].'-'.$parts[1].'-'.$parts[0].'", "t": ['.$1."]},\n";
  }
}