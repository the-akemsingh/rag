from tavily import TavilyClient
import os
from dotenv import load_dotenv

load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
tavily_client = TavilyClient(TAVILY_API_KEY)
response = tavily_client.search("Who is Leo Messi?")

print(response)
# {
#   'query': 'Who is Leo Messi?',
#   'follow_up_questions': None,
#   'answer': None,
#   'images': [
    
#   ],
#   'results': [
#     {
#       'url': 'https://www.imdb.com/name/nm2177779',
#       'title': 'Lionel Messi',
#       'content': "What's on TV & streamingTop 250 TV showsMost popular TV showsBrowse TV shows by genreTV news. # Lionel Messi. Lionel Messi is a football player from Argentina who plays for Inter Miami. He has won the Ballon D'Or, the annual award given to the best player in the world, 8 times, 2022 FIFA World Cup winner and an Olympic gold medal winner in 2008. He showed an enormous aptitude for football and was in the youth teams for Newell's Old Boys, his local team. Faced with mounting medical expenses to treat a growth hormone condition, Messi's family accepted an offer to move the 13-year-old prodigy to FC Barcelona, who would pay for his treatment. Messi has gone on to become one of the most decorated players in football history and has broken countless records for his club and his country. Image 8: View PosterImage 9: View PosterImage 10: View Poster+ 5 Image 11: View Poster.",
#       'score': 0.7520312,
#       'raw_content': None
#     },
#     {
#       'url': 'https://www.mlssoccer.com/players/lionel-messi',
#       'title': 'Leo Messi | MLSsoccer.com',
#       'content': "# Leo Messi. ### Roster Category. ### Player Category. Messi, De Paul help Argentina clinch World Cup knockout spot. Lionel Messi, Rodrigo De Paul and Argentina are through to the 2026 FIFA World Cup Round of 32 following a 2-0 win against Austria on Monday in Dallas. Lionel Messi becomes World Cup's all-time leading goalscorer. Messi outshines Haaland, Mbappé on historic World Cup matchday. Lionel Messi ties World Cup goals record with Argentina hat trick. Lionel Messi joins Cristiano Ronaldo on prestigious World Cup list. Lionel Messi eyes historic World Cup with Argentina. ## WATCH: Argentina forward Lionel Messi | 2026 FIFA World Cup. WATCH: Lionel Messi departs Miami vs. WATCH: Argentina forward Lionel Messi | 2026 FIFA World Cup. ## WATCH: Lionel Messi departs Miami vs. Philadelphia with apparent leg injury. Lionel Messi's red-hot form leads Miami. ## WATCH: MVP 3.0? WATCH: Lionel Messi breaks ice with wacky goal vs. New York City site address. Red Bull New York site address.",
#       'score': 0.64478505,
#       'raw_content': None
#     },
#     {
#       'url': 'https://en.wikipedia.org/wiki/Lionel_Messi',
#       'title': 'Lionel Messi - Wikipedia',
#       'content': '[Jump to content](https://en.wikipedia.org/wiki/Lionel_Messi#bodyContent). *   [(Top)](https://en.wikipedia.org/wiki/Lionel_Messi#). *   [1 Early life](https://en.wikipedia.org/wiki/Lionel_Messi#Early_life). *   [2.2 Barcelona](https://en.wikipedia.org/wiki/Lionel_Messi#Barcelona). *   [3.1 Barcelona](https://en.wikipedia.org/wiki/Lionel_Messi#Barcelona_2). *   [3.1.1 2004–2008: Rise to the first team](https://en.wikipedia.org/wiki/Lionel_Messi#2004%E2%80%932008:_Rise_to_the_first_team). *   [3.1.2 2008–2012: Success under Pep Guardiola](https://en.wikipedia.org/wiki/Lionel_Messi#2008%E2%80%932012:_Success_under_Pep_Guardiola). *   [3.1.3 2012–2014: Record-breaking year and _Messidependencia_](https://en.wikipedia.org/wiki/Lionel_Messi#2012%E2%80%932014:_Record-breaking_year_and_Messidependencia). *   [3.1.4 2014–2017: Arrival of Luis Enrique and birth of MSN](https://en.wikipedia.org/wiki/Lionel_Messi#2014%E2%80%932017:_Arrival_of_Luis_Enrique_and_birth_of_MSN). *   [3.1.5 2017–2021: Final years at Barcelona](https://en.wikipedia.org/wiki/Lionel_Messi#2017%E2%80%932021:_Final_years_at_Barcelona). *   [3.2.1 2021–2023: 7th Ballon d\'Or and consecutive Ligue 1 titles](https://en.wikipedia.org/wiki/Lionel_Messi#2021%E2%80%932023:_7th_Ballon_d\'Or_and_consecutive_Ligue_1_titles). *   [3.3 Inter Miami](https://en.wikipedia.org/wiki/Lionel_Messi#Inter_Miami). *   [4 International career](https://en.wikipedia.org/wiki/Lionel_Messi#International_career). *   [5.1 Style of play](https://en.wikipedia.org/wiki/Lionel_Messi#Style_of_play). *   [5.3 Reception](https://en.wikipedia.org/wiki/Lionel_Messi#Reception). *   [6.1 Popularity](https://en.wikipedia.org/wiki/Lionel_Messi#Popularity). *   [6.4 Media](https://en.wikipedia.org/wiki/Lionel_Messi#Media). *   [7 Philanthropy](https://en.wikipedia.org/wiki/Lionel_Messi#Philanthropy). *   [8.1 Family and relationships](https://en.wikipedia.org/wiki/Lionel_Messi#Family_and_relationships). *   [8.2 Tax fraud](https://en.wikipedia.org/wiki/Lionel_Messi#Tax_fraud). *   [9.1 Club](https://en.wikipedia.org/wiki/Lionel_Messi#Club). *   [9.2 International](https://en.wikipedia.org/wiki/Lionel_Messi#International). *   [10 Honours](https://en.wikipedia.org/wiki/Lionel_Messi#Honours). *   [11 See also](https://en.wikipedia.org/wiki/Lionel_Messi#See_also). *   [12 Notes](https://en.wikipedia.org/wiki/Lionel_Messi#Notes). *   [13 References](https://en.wikipedia.org/wiki/Lionel_Messi#References). *   [14 External links](https://en.wikipedia.org/wiki/Lionel_Messi#External_links). *   [Article](https://en.wikipedia.org/wiki/Lionel_Messi "View the content page [alt-c]"). *   [Talk](https://en.wikipedia.org/wiki/Talk:Lionel_Messi "Discuss improvements to the content page [alt-t]"). *   [Read](https://en.wikipedia.org/wiki/Lionel_Messi). *   [Read](https://en.wikipedia.org/wiki/Lionel_Messi). He was an alien."[[54]](https://en.wikipedia.org/wiki/Lionel_Messi#cite_note-62). *   [Lionel Messi](https://en.wikipedia.org/wiki/Category:Lionel_Messi "Category:Lionel Messi"). *   [Edit preview settings](https://en.wikipedia.org/wiki/Lionel_Messi#). 190 languages[Add topic](https://en.wikipedia.org/wiki/Lionel_Messi#). [](https://en.wikipedia.org/wiki/Lionel_Messi?action=edit).',
#       'score': 0.6304352,
#       'raw_content': None
#     },
#     {
#       'url': 'https://www.olympics.com/en/athletes/lionel-messi',
#       'title': 'Lionel Messi | Biography, Competitions, Wins and Medals',
#       'content': "### Lionel Messi at FIFA World Cup: Biggest disappointments of Argentina superstar. Born in Rosario, Argentina, in 1987, **Lionel Messi** is widely regarded as one of the greatest football players of all time, and his illustrious career proves why. When Messi was 13 years old, he and his family moved to Barcelona, where the club assisted him in treating his **growth hormone deficiency**. At 17, he made his first senior appearance for the club and became a vital player for the Blaugranas. He is also the **all-time leading scorer in La Liga**, with an incredible 474 goals to his name. He was instrumental in helping them win the **FIFA World Cup 2022** in Qatar, where he also won the **Golden Ball**, awarded to the competition's best player. He was also part of the Argentina under-23 team that won **Olympic gold** at the Beijing 2008 Games, which remains one of his most treasured career highlights. # Lionel MESSI. ### FIFA World Cup 2022: What records did Lionel Messi break?",
#       'score': 0.6108487,
#       'raw_content': None
#     },
#     {
#       'url': 'https://www.intermiamicf.com/players/lionel-messi',
#       'title': 'Leo Messi | Inter Miami CF',
#       'content': '# Leo Messi. * [Profile](/players/lionel-messi/index). * [Career Stats](/players/lionel-messi/stats/index). * [Match Log](/players/lionel-messi/match-log/index). * [News](/players/lionel-messi/news/index). * [Video](/players/lionel-messi/video/index). ### Player Category. * [## MATCH RECAP: Historic Night for Messi in Argentina\'s Win Against Austria. Inter Miami CF captain Leo Messi scored a brace to secure the result as Argentina sealed a place in the Round of 32](/news/match-recap-historic-night-for-messi-in-argentina-s-win-against-austria "MATCH RECAP: Historic Night for Messi in Argentina\'s Win Against Austria "). * [## Leo Messi Becomes FIFA World Cup™’s All-Time Leading Men’s Goalscorer](/news/leo-messi-becomes-fifa-world-cuptm-s-all-time-leading-men-s-goalscorer "Leo Messi Becomes FIFA World Cup™’s All-Time Leading Men’s Goalscorer"). * [## MATCH PREVIEW: Messi and De Paul Kick Off FIFA World Cup Title Defense as Argentina Faces Algeria](/news/match-preview-messi-and-de-paul-kick-off-fifa-world-cup-title-defense-as-argentina-faces-algeria "MATCH PREVIEW: Messi and De Paul Kick Off FIFA World Cup Title Defense as Argentina Faces Algeria"). * [## Called Up: Nine Inter Miami CF Players Set for International Duty During Summer FIFA Window](/news/called-up-nine-inter-miami-cf-players-set-for-international-duty-during-summer-fifa-window "Called Up: Nine Inter Miami CF Players Set for International Duty During Summer FIFA Window").',
#       'score': 0.5920305,
#       'raw_content': None
#     }
#   ],
#   'response_time': 0.0,
#   'request_id': 'a7506891-7c7d-48f7-a4e2-221e1bbe45df'
# }