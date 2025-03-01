import * as React from 'react'
import useSWR from 'swr'
import {loadPlaylist} from 'lib/playlists'
import {FunctionComponent} from 'react'
import {GetServerSideProps} from 'next'
import {filter} from 'lodash'
import fetcher from 'utils/fetcher'
import CollectionPageLayout from 'components/layouts/collection-page-layout'

type PlaylistProps = {
  playlist: any
}

const Playlist: FunctionComponent<PlaylistProps> = ({
  playlist: initialPlaylist,
}) => {
  const {data} = useSWR(initialPlaylist.url, fetcher)

  const course = {...data, ...initialPlaylist}

  const {slug, items} = course

  const lessons = filter(items, (item) => {
    return ['lesson', 'talk'].includes(item.type)
  })

  return (
    <CollectionPageLayout
      lessons={lessons}
      course={course}
      ogImageUrl={`https://og-image-react-egghead.now.sh/playlists/${slug}?v=20201103`}
    />
  )
}

export default Playlist

export const getServerSideProps: GetServerSideProps = async ({
  res,
  req,
  params,
}) => {
  const slug = params && (params.slug as string)
  const playlist = slug && (await loadPlaylist(slug))

  if (playlist?.slug != slug) {
    res.setHeader('Location', playlist.path)
    res.statusCode = 302
    res.end()
    return {props: {}}
  } else {
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    return {
      props: {
        playlist,
      },
    }
  }
}
