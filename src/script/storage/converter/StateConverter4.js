/**
 * move to serverside past TBD
 */

import StateConverter from "../StateConverter.js";

const EXIT_TRANS = {
    "region.deku_tree_lobby": "region.deku_tree_gateway",
    "region.dodongos_cavern_beginning": "region.dodongos_cavern_gateway",
    "region.jabu_jabus_belly_beginning": "region.jabu_jabus_belly_gateway",
    "region.bottom_of_the_well": "region.bottom_of_the_well_gateway",
    "region.forest_temple_lobby": "region.forest_temple_gateway",
    "region.fire_temple_lower": "region.fire_temple_gateway",
    "region.water_temple_lobby": "region.water_temple_gateway",
    "region.spirit_temple_lobby": "region.spirit_temple_gateway",
    "region.shadow_temple_entryway": "region.shadow_temple_gateway",
    "region.ice_cavern_beginning": "region.ice_cavern_gateway",
    "region.gerudo_training_grounds_lobby": "region.gerudo_training_grounds_gateway"
};

const SKIP_CONVERT = {
    "skip.hidden_grotto_no_agony": "skip.grottos_without_agony",
    "skip.hammer_through_wall": "skip.rusted_switches",
    "skip.fewer_tunic": "skip.fewer_tunic_requirements",
    "skip.one_way_pass": "skip.visible_collisions",
    "skip.forest_adult_gs_hover": "skip.adult_kokiri_gs",
    "skip.lost_woods_bridge_jump": "skip.lost_woods_bridge",
    "skip.mido_skip": "skip.mido_backflip",
    "skip.lost_woods_stage_skulltula_no_beans": "skip.lost_woods_gs_bean",
    "skip.lake_lab_gs_jumpslash": "skip.lab_wall_gs",
    "skip.water_temple_early_hookshot": "skip.water_hookshot_entry",
    "skip.lab_hookshot": "skip.lab_diving",
    "skip.gerudo_crate_hovers": "skip.valley_crate_hovers",
    "skip.naked_wasteland": "skip.wasteland_crossing",
    "skip.kakariko_gs_with_jumpslash": "skip.kakariko_tower_gs",
    "skip.windmill_hp": "skip.windmill_poh",
    "skip.graveyard_poh_boomerang": "skip.graveyard_poh",
    "skip.dm_bomb_strength": "skip.dmt_bombable",
    "skip.dm_soil_no_explosives": "skip.dmt_soil_gs",
    "skip.dm_lower_gs_hookshot": "skip.trail_gs_lower_hookshot",
    "skip.dm_lower_gs_bean": "skip.trail_gs_lower_bean",
    "skip.dm_upper_gs_no_hammer": "skip.trail_gs_upper",
    "skip.linkthegoron_dins": "skip.link_goron_dins",
    "skip.goron_left_maze_hovers": "skip.goron_city_leftmost",
    "skip.goron_spinning_pot_strength": "skip.goron_city_pot_with_strength",
    "skip.goron_pot_bombchu": "skip.goron_city_pot",
    "skip.hotrodder_child_strength": "skip.child_rolling_with_strength",
    "skip.dmc_mash_hammer": "skip.crater_upper_to_lower",
    "skip.crater_bean_hp": "skip.crater_bean_poh_with_hovers",
    "skip.zora_1st_hp_no_hovers": "skip.zora_river_lower",
    "skip.zora_2nd_hp_no_hovers": "skip.zora_river_upper",
    "skip.zora_hover": "skip.zora_with_hover",
    "skip.zora_cucco": "skip.zora_with_cucco",
    "skip.botw_strength_sticks": "skip.botw_basement",
    "skip.well_cage_gs_no_boomerang": "skip.botw_cage_gs",
    "skip.wellmq_deadhand_key_boomerang": "skip.botw_mq_dead_hand_key",
    "skip.deku_vine_gs": "skip.deku_basement_gs",
    "skip.deku_b1_webs_bow": "skip.deku_b1_webs_with_bow",
    "skip.deku_tree_B1_skip": "skip.deku_b1_skip",
    "skip.dodongo_scarecrow_armos": "skip.dc_scarecrow_gs",
    "skip.dodongo_staircase": "skip.dc_staircase",
    "skip.dodongo_child_slingshot_skip": "skip.dc_slingshot_skip",
    "skip.dodongo_spike": "skip.dc_jump",
    "skip.dodongomq_early_bombbag_child": "skip.dc_mq_child_bombs",
    "skip.jabu_scrub_dive": "skip.jabu_scrub_jump_dive",
    "skip.jjmq_sot_boomerang": "skip.jabu_mq_sot_gs",
    "skip.icmq_scarecrow_gs_noitems": "skip.ice_mq_scarecrow",
    "skip.gtg_rupees_nohookshot": "skip.gtg_without_hookshot",
    "skip.gtg_ledge_hovers": "gtg_fake_wall",
    "skip.gtgmq_rupees_nohookshot": "skip.gtg_mq_without_hookshot",
    "skip.gtgmq_silver_hook": "skip.gtg_mq_with_hookshot",
    "skip.spirit_trial_without_hookshot": "skip.spirit_trial_hookshot",
    "skip.sht_mq_no_fire": "skip.shadow_trial_mq",
    "skip.light_trial_mq_nohookshot": "skip.light_trial_mq",
    "skip.forest_temple_ledge": "skip.forest_outdoors_ledge",
    "skip.forest_temple_east_gs": "skip.forest_outdoor_east_gs",
    "skip.fot_east_vines_hook": "skip.forest_vines",
    "skip.forest_temple_pierre_early": "skip.forest_scarecrow",
    "skip.forest_temple_floormaster_strength": "skip.forest_outside_backdoor",
    "skip.fotmq_puzzle_bombchu": "skip.forest_mq_block_puzzle",
    "skip.fotmq_hallway_hook": "skip.forest_mq_hallway_switch",
    "skip.fotmq_well_hook": "skip.forest_well_swim",
    "skip.fit_bossdoor_noitems": "skip.fire_boss_door_jump",
    "skip.fit_gs_nosot": "skip.fire_song_of_time",
    "skip.fit_climb_nostrength": "skip.fire_strength",
    "skip.fit_east_noscarecrow": "skip.fire_scarecrow",
    "skip.fit_fire_maze_skip": "skip.fire_flame_maze",
    "skip.fitmq_near_boss_nocrate": "skip.fire_mq_near_boss",
    "skip.fitmq_bosskey_nobow": "skip.fire_mq_bk_chest",
    "skip.fitmq_bombable_no_hook": "skip.fire_mq_bombable_chest",
    "skip.fitmq_climb_no_fire": "skip.fire_mq_climb",
    "skip.fitmq_boulder_side": "skip.fire_mq_maze_side_room",
    "skip.fitmq_fire_maze_skip": "skip.fire_mq_flame_maze",
    "skip.wt_torch_longshot": "skip.water_temple_torch_longshot",
    "skip.wt_central_bow_nothing": "skip.water_central_bow",
    "skip.wt_cracked_noitems": "skip.water_cracked_wall_nothing",
    "skip.wt_cracked_wall_hovers": "skip.water_cracked_wall_hovers",
    "skip.wt_boss_key_hovers": "skip.water_boss_key_region",
    "skip.wt_dragon_bombchu": "skip.water_dragon_bombchu",
    "skip.wt_dragon_jump_dive": "skip.water_dragon_jump_dive",
    "skip.wt_bosskey_jumpdive": "skip.water_bk_jump_dive",
    "skip.wt_bosskey_iron_boots": "skip.water_bk_chest",
    "skip.wt_bosskey_noitem": "skip.water_north_basement_ledge_jump",
    "skip.wt_serpent_gs_noirons": "skip.water_river_gs",
    "skip.wt_platform_gs_hookshot": "skip.water_falling_platform_gs",
    "skip.shadow_temple_stone_umbrella_skip": "skip.shadow_umbrella",
    "skip.shadow_temple_freestand_bombchu": "skip.shadow_freestand_key",
    "skip.shadow_temple_river_statue_bombchu": "skip.shadow_statue",
    "skip.shtmq_torch_bow": "skip.shadow_mq_gap",
    "skip.shtmq_lower_nofire": "skip.shadow_mq_huge_pit",
    "skip.spt_child_bridge_bombchu": "skip.spirit_child_bombchu",
    "skip.spt_adult_switch_bombs": "skip.spirit_lower_adult_switch",
    "skip.spt_map_bow": "skip.spirit_map_chest",
    "skip.spt_sun_chest_bow": "skip.spirit_sun_chest",
    "skip.spt_main_room_gs_boomerang": "skip.spirit_lobby_gs",
    "skip.spt_shifting_wall_noitems": "skip.spirit_wall",
    "skip.sptmq_frozen_nofire": "skip.spirit_mq_frozen_eye",
    "skip.sptmq_lower_no_firearrows": "skip.spirit_mq_lower_adult",
    "skip.sptmq_sunblock_gs_boomerang": "skip.spirit_mq_sun_block_gs"
};

StateConverter.register(function(state) {
    const res = {
        data: {},
        extra: state.extra || {},
        notes: state.notes || state.data.notes || "",
        autosave: state.autosave,
        timestamp: state.timestamp,
        name: state.name
    };
    for (const i of Object.keys(state.data)) {
        if (i == "notes") continue;
        if (i.startsWith("shop.")) {
            if (i.endsWith(".names")) {
                res.extra.shops_names = res.extra.shops_names || {};
                res.extra.shops_names[i.slice(0, -6)] = state.data[i];
            } else if (i.endsWith(".bought")) {
                res.extra.shops_bought = res.extra.shops_bought || {};
                res.extra.shops_bought[i.slice(0, -7)] = state.data[i];
            } else {
                res.extra.shops_items = res.extra.shops_items || {};
                res.extra.shops_items[i] = state.data[i];
            }
        } else if (i.startsWith("song.")) {
            res.extra.songs = res.extra.songs || {};
            res.extra.songs[i] = state.data[i];
        } else if (i == "option.keysanity_small") {
            const val = state.data[i];
            if (typeof val == "string") {
                res.data[i] = val == "keysanity_small_keysanity";
                res.data["option.track_keys"] = val != "keysanity_small_ignore";
            }
        } else if (i == "option.keysanity_boss") {
            const val = state.data[i];
            if (typeof val == "string") {
                res.data["option.track_bosskeys"] = val != "keysanity_boss_ignore";
            }
        } else if (SKIP_CONVERT[i] != null) {
            res.data[SKIP_CONVERT[i]] = state.data[i];
        } else {
            res.data[i] = state.data[i];
        }
    }
    if (res.data["option.starting_age"] == null) {
        res.data["option.starting_age"] = "child";
    }
    if (res.data["option.light_arrow_cutscene"] == null) {
        res.data["option.light_arrow_cutscene"] = "light_arrow_cutscene_vanilla";
    }
    if (res.data["option.doors_open_forest"] == null || res.data["option.doors_open_forest"] === true) {
        res.data["option.doors_open_forest"] = "doors_open_forest_open";
    }
    if (res.data["option.doors_open_forest"] === false) {
        res.data["option.doors_open_forest"] = "doors_open_forest_closed";
    }
    if (state.extra != null && state.extra.exits != null) {
        const buf = {};
        for (const i of Object.keys(state.extra.exits)) {
            const [k1, k2] = i.split(" -> ");
            const [v1, v2] = state.extra.exits[i].split(" -> ");
            buf[`${EXIT_TRANS[k1] || k1} -> ${EXIT_TRANS[k2] || k2}`] = `${EXIT_TRANS[v1] || v1} -> ${EXIT_TRANS[v2] || v2}`;
        }
        res.extra.exits = buf;
    }
    return res;
});
