---
name: Cine Daily (derived from the user's reference landing-page video)
scope: Whole site. The stacked showreel and /work/$slug pages keep the film-card layout from the
  earlier Siena reference, recoloured into this palette.
colors:
  night: "#0B0B0C" # hero, dark cards
  night-2: "#18181A" # dark stat circle, raised dark surfaces
  paper: "#FFFFFF" # white sections
  paper-2: "#F4F3F1" # soft fills on white, cream tickets
  red: "#D0142C" # the one accent: logo aperture, red circle, CTA, active dot
  red-deep: "#8E0A1C" # shadow side of red, strip edge
  ink: "#0B0B0C" # type on white
  mute-dark: "#8B8B90" # secondary type on night
  mute-light: "#6E6E73" # secondary type on paper
  line-dark: "#FFFFFF1F" # hairlines and guide rings on night
  line-light: "#0B0B0C1A" # hairlines and guide rings on paper
typography:
  display: { family: "Bebas Neue", weight: 400, case: upper, tracking: "0", leading: 0.82 }
  hero-title: "clamp(5.5rem, 23vw, 26rem)"
  section-title: "clamp(3.5rem, 11vw, 11rem)"
  headline: "clamp(1.6rem, 3.2vw, 3rem)"
  credit: "clamp(1rem, 1.6vw, 1.6rem)" # cast-style names, display face
  label: { family: "Inter", weight: 500, size: "0.62rem", case: upper, tracking: "0.24em" }
  body: { family: "Inter", weight: 400, size: "0.72rem", leading: 1.45 }
rounded:
  frame: "1.75rem" # section edges where black meets white
  card: "1.1rem"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 3.2vw, 3rem)"
---

# Look

A movie-release landing page. One giant condensed title fills the hero, the subject's cut-out
stands in the gap between the two words (the full name is always readable), a red disc sits
behind, and an old near-black film strip rolls across the bottom of the title: each
frame is one project still with four pale sprocket holes above and below it, as on 35mm. Black bands hand over to white bands with a rounded edge.

## Rules

- Display type is Bebas Neue, uppercase, tight leading. Headline "BY" style connectors are set
  small between two giant words ("DIRECTED by NAMAN JAIN").
- Labels are tiny Inter caps with wide tracking, prefixed by a small red dotted disc.
- Red is the only accent. It appears as: the logo aperture, the disc behind the title, the
  middle stat circle, the primary CTA, the left round arrow button. The strip stays black.
- Faint guide rings and cross-hair lines (line-dark / line-light) sit behind every section.
- The cut-out portrait always overlaps type; type never overlaps the face.
- Body copy is short and set small; uppercase lead-in ("PART A") before each paragraph.
- No gradients except the scrim over footage in the showreel.

## Components

- **Header**: logo PORTFOLIO (its first O a red camera aperture) left, tracked nav with dot separators centre, a small red dot
  under the active item, two outlined icon circles and a filled hamburger circle on the right.
- **Hero**: genre chips (outlined pills) top-left, release label top-right, four credit names
  across, giant title with a red stacked "Film / Maker" at the far right, film strip, story blurb
  bottom-left, and an
  outlined "CONTACT ↗" pill and a spinning sticker badge bottom-right.
- **Motion**: Locomotive Scroll (v5, native-scroll smoothing) on every page.
- **Ticket card**: night card, red tab on top, "FILM" label, title, image tile, 2×2 fact cells,
  full-width red CTA.
- **Finale**: pinned scroll scene: a camera back rises with its screen black; a light flickers on
  to show a stage with an empty director's chair, the exposure dial turns -3 to 0 EV, the screen
  zooms in on the chair, then the shutter fires: in the flash the camera is gone. Revealed, in two
  columns that never overlap: me in the chair in a warm glow (left) and a right-aligned card:
  availability pill, serif "Hi, I'm *Naman.*" (name red italic), roles, line, red "Let's Talk" plus
  outlined Email and LinkedIn buttons. Phones stack the card above the photo.
