pub mod app;
pub mod dashboard;
pub mod property_view;
pub mod tenant_view;
pub mod cost_view;
pub mod settlement_view;

use ratatui::Frame;
use ratatui::layout::Layout;
use app::App;

pub fn draw(f: &mut Frame, app: &mut App) {
    let chunks = Layout::default()
        .horizontal_margin(2)
        .vertical_margin(1)
        .split(f.size());

    match app.current_view {
        app::View::Dashboard => dashboard::draw(f, chunks[0], app),
        app::View::Property => property_view::draw(f, chunks[0], app),
        app::View::Tenant => tenant_view::draw(f, chunks[0], app),
        app::View::Cost => cost_view::draw(f, chunks[0], app),
        app::View::Settlement => settlement_view::draw(f, chunks[0], app),
    }
}
