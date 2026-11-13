import type { WorldName } from '../types';
import type { WorldBuilder } from './shared';
import { constellation } from './constellation';
import { mesa } from './mesa';
import { records } from './records';
import { intake } from './intake';
import { sparks } from './sparks';
import { homelab } from './homelab';
import { envelopes } from './envelopes';
import { radar } from './radar';
import { strata } from './strata';
import { blueprint } from './blueprint';
import { lattice } from './lattice';
import { fit } from './fit';
import { plant } from './plant';
import { patrol } from './patrol';
import { sites } from './sites';

export const BUILDERS: Record<WorldName, WorldBuilder> = {
  constellation, mesa, records, intake, sparks, homelab, envelopes, radar, strata, blueprint, lattice, fit, plant, patrol, sites,
};

export type { WorldBuilder, Scene, BuildCtx, Label, Stage } from './shared';
