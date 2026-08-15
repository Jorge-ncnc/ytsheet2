use strict;
use warnings;
use utf8;
use Test::More;

sub deduplicate { return @_ }
sub s_eval { return 0 }
sub commify { return $_[0] }

our $ver = '2.00.009';

require './_core/lib/sw2/subroutine-sw2.pl';

is_deeply(
  [accessorySuffixes()],
  ['', '_', '__', '___', '____', '_____', '______'],
  'provide all accessory suffixes',
);

subtest 'restore checkbox chain from accessory data' => sub {
  my %pc = (
    accessoryHead___Name => '追加装飾品',
  );

  restoreAccessoryAddFlags(\%pc);

  is($pc{accessoryHeadAdd},   1, 'restore first checkbox');
  is($pc{accessoryHead_Add},  1, 'restore second checkbox');
  is($pc{accessoryHead__Add}, 1, 'restore third checkbox');
  ok(!exists $pc{accessoryHead___Add}, 'do not open the row after the populated row');
};

subtest 'restore from fields other than name' => sub {
  my %pc = (
    accessoryEar______Own => 'HP',
  );

  restoreAccessoryAddFlags(\%pc);

  foreach my $depth (0 .. 5){
    ok($pc{'accessoryEar'.('_' x $depth).'Add'}, "restore checkbox at depth ${depth}");
  }
};

subtest 'ignore empty accessory rows' => sub {
  my %pc = (
    accessoryFace___Name => '',
    accessoryFace___Own  => '',
    accessoryFace___Note => '',
  );

  restoreAccessoryAddFlags(\%pc);

  ok(!grep(/Add$/, keys %pc), 'do not add checkbox state');
};

subtest 'restore only legacy sheet data' => sub {
  my %legacy = upgradeCharaData({
    ver => '1.29.002',
    accessoryBack____Name => 'legacy accessory',
  });
  ok($legacy{accessoryBack___Add}, 'restore legacy checkbox state');

  my %current = upgradeCharaData({
    ver => '2.00.009',
    accessoryBack____Name => 'current accessory',
  });
  ok(!exists $current{accessoryBack___Add}, 'preserve current checkbox state');
};

done_testing;
